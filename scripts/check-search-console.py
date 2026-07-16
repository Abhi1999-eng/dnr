#!/usr/bin/env python3
import argparse
import base64
import json
import os
import subprocess
import sys
import tempfile
import time
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Any, Optional, Set


DEFAULT_PROPERTY_URL = "https://dnrtechnoservices.com/"
DEFAULT_SITEMAP_URL = f"{DEFAULT_PROPERTY_URL}sitemap.xml"
URL_INSPECTION_ENDPOINT = "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect"
SITEMAP_SUBMIT_ENDPOINT = "https://www.googleapis.com/webmasters/v3/sites/{site}/sitemaps/{feed}"
SITES_ENDPOINT = "https://www.googleapis.com/webmasters/v3/sites"
SITEMAP_NAMESPACE = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}


def b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def sign_rs256(message: bytes, private_key: str) -> bytes:
    with tempfile.NamedTemporaryFile("w", delete=False) as temp_key:
        temp_key.write(private_key)
        temp_key_path = temp_key.name

    try:
        proc = subprocess.run(
            ["openssl", "dgst", "-sha256", "-sign", temp_key_path],
            input=message,
            capture_output=True,
            check=True,
        )
        return proc.stdout
    finally:
        Path(temp_key_path).unlink(missing_ok=True)


def load_credentials() -> dict[str, Any]:
    credential_path = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS", "")
    if not credential_path:
        raise RuntimeError("GOOGLE_APPLICATION_CREDENTIALS is not set.")

    payload = json.loads(Path(credential_path).read_text())
    if payload.get("type") != "service_account":
        raise RuntimeError("Credential file is not a service account JSON.")
    return payload


def get_access_token(scope: str) -> str:
    creds = load_credentials()
    now = int(time.time())
    header = {"alg": "RS256", "typ": "JWT"}
    claim_set = {
        "iss": creds["client_email"],
        "scope": scope,
        "aud": creds["token_uri"],
        "exp": now + 3600,
        "iat": now,
    }
    signing_input = f"{b64url(json.dumps(header, separators=(',', ':')).encode())}.{b64url(json.dumps(claim_set, separators=(',', ':')).encode())}"
    signature = sign_rs256(signing_input.encode(), creds["private_key"])
    jwt_assertion = f"{signing_input}.{b64url(signature)}"

    data = urllib.parse.urlencode(
        {
            "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
            "assertion": jwt_assertion,
        }
    ).encode()
    req = urllib.request.Request(
        creds["token_uri"],
        data=data,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode())["access_token"]


def request_json(url: str, *, method: str = "GET", headers: Optional[dict[str, str]] = None, data: Optional[bytes] = None) -> Any:
    req = urllib.request.Request(url, method=method, data=data, headers=headers or {})
    with urllib.request.urlopen(req, timeout=45) as resp:
        body = resp.read().decode()
        if not body:
            return {}
        return json.loads(body)


def request_text(url: str) -> str:
    with urllib.request.urlopen(url, timeout=45) as resp:
        return resp.read().decode()


def list_sites(access_token: str) -> list[dict[str, Any]]:
    data = request_json(
        SITES_ENDPOINT,
        headers={"Authorization": f"Bearer {access_token}"},
    )
    return data.get("siteEntry", [])


def verify_access(property_url: str) -> dict[str, Any]:
    access_token = get_access_token("https://www.googleapis.com/auth/webmasters.readonly")
    site_entries = list_sites(access_token)
    permission = next((entry.get("permissionLevel") for entry in site_entries if entry.get("siteUrl") == property_url), None)
    return {
        "property": property_url,
        "siteCount": len(site_entries),
        "permissionLevel": permission,
        "hasPropertyAccess": permission is not None,
    }


def submit_sitemap(property_url: str, sitemap_url: str) -> dict[str, Any]:
    access_token = get_access_token("https://www.googleapis.com/auth/webmasters")
    site = urllib.parse.quote(property_url, safe="")
    feed = urllib.parse.quote(sitemap_url, safe="")
    endpoint = SITEMAP_SUBMIT_ENDPOINT.format(site=site, feed=feed)
    request_json(
        endpoint,
        method="PUT",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    return {
        "property": property_url,
        "submittedSitemap": sitemap_url,
        "submittedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "status": "submitted",
    }


def parse_sitemap(url: str, *, limit: int, seen: Optional[Set[str]] = None) -> list[str]:
    seen = seen or set()
    if url in seen:
        return []
    seen.add(url)

    root = ET.fromstring(request_text(url))
    tag = root.tag.split("}")[-1]

    if tag == "urlset":
        urls = []
        for loc in root.findall("sm:url/sm:loc", SITEMAP_NAMESPACE):
            if loc.text:
                urls.append(loc.text.strip())
            if len(urls) >= limit:
                break
        return urls

    if tag == "sitemapindex":
        urls: list[str] = []
        for loc in root.findall("sm:sitemap/sm:loc", SITEMAP_NAMESPACE):
            if not loc.text:
                continue
            urls.extend(parse_sitemap(loc.text.strip(), limit=limit - len(urls), seen=seen))
            if len(urls) >= limit:
                break
        return urls

    raise RuntimeError(f"Unsupported sitemap format for {url}")


def inspect_url(property_url: str, inspection_url: str, language_code: str = "en-US") -> dict[str, Any]:
    access_token = get_access_token("https://www.googleapis.com/auth/webmasters.readonly")
    payload = json.dumps(
        {
            "inspectionUrl": inspection_url,
            "siteUrl": property_url,
            "languageCode": language_code,
        }
    ).encode()
    response = request_json(
        URL_INSPECTION_ENDPOINT,
        method="POST",
        headers={
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
        },
        data=payload,
    )
    return response.get("inspectionResult", {})


def summarize_inspection(url: str, payload: dict[str, Any]) -> dict[str, Any]:
    index_status = payload.get("indexStatusResult", {})
    return {
        "url": url,
        "verdict": index_status.get("verdict"),
        "coverageState": index_status.get("coverageState"),
        "indexingState": index_status.get("indexingState"),
        "lastCrawlTime": index_status.get("lastCrawlTime"),
        "pageFetchState": index_status.get("pageFetchState"),
        "robotsTxtState": index_status.get("robotsTxtState"),
        "googleCanonical": index_status.get("googleCanonical"),
        "userCanonical": index_status.get("userCanonical"),
        "referringUrls": index_status.get("referringUrls", []),
    }


def print_text_report(rows: list[dict[str, Any]]) -> None:
    for index, row in enumerate(rows, start=1):
        print(f"[{index}] {row['url']}")
        print(f"    verdict: {row.get('verdict') or 'unknown'}")
        print(f"    coverage: {row.get('coverageState') or 'unknown'}")
        print(f"    indexing: {row.get('indexingState') or 'unknown'}")
        print(f"    fetch: {row.get('pageFetchState') or 'unknown'} | robots: {row.get('robotsTxtState') or 'unknown'}")
        if row.get("googleCanonical") or row.get("userCanonical"):
            print(f"    canonicals: google={row.get('googleCanonical') or '-'} | user={row.get('userCanonical') or '-'}")
        if row.get("lastCrawlTime"):
            print(f"    last crawl: {row['lastCrawlTime']}")
        if index != len(rows):
            print()


def load_urls_from_args(args: argparse.Namespace) -> list[str]:
    urls: list[str] = []

    if args.url:
        urls.extend(args.url)

    if args.urls_file:
        file_urls = [line.strip() for line in Path(args.urls_file).read_text().splitlines() if line.strip()]
        urls.extend(file_urls)

    if args.from_sitemap:
        urls.extend(parse_sitemap(args.from_sitemap, limit=args.limit))

    deduped = []
    seen = set()
    for url in urls:
        if url not in seen:
            deduped.append(url)
            seen.add(url)
    return deduped[: args.limit]


def handle_verify(args: argparse.Namespace) -> int:
    print(json.dumps(verify_access(args.property_url), indent=2))
    return 0


def handle_submit_sitemap(args: argparse.Namespace) -> int:
    print(json.dumps(submit_sitemap(args.property_url, args.sitemap_url), indent=2))
    return 0


def handle_inspect(args: argparse.Namespace) -> int:
    urls = load_urls_from_args(args)
    if not urls:
        raise RuntimeError("No URLs supplied. Use --url, --urls-file, or --from-sitemap.")

    rows = [summarize_inspection(url, inspect_url(args.property_url, url, args.language_code)) for url in urls]
    if args.output == "json":
        print(json.dumps({"property": args.property_url, "count": len(rows), "results": rows}, indent=2))
    else:
        print_text_report(rows)
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Local Search Console helpers for DNR.")
    parser.set_defaults(property_url=os.environ.get("SEARCH_CONSOLE_PROPERTY_URL", DEFAULT_PROPERTY_URL))
    subparsers = parser.add_subparsers(dest="command", required=True)

    verify_parser = subparsers.add_parser("verify", help="Check Search Console property access.")
    verify_parser.add_argument("--property-url", default=parser.get_default("property_url"))
    verify_parser.set_defaults(func=handle_verify)

    submit_parser = subparsers.add_parser("submit-sitemap", help="Submit a sitemap through the Search Console API.")
    submit_parser.add_argument("--property-url", default=parser.get_default("property_url"))
    submit_parser.add_argument("--sitemap-url", default=os.environ.get("SEARCH_CONSOLE_SITEMAP_URL", DEFAULT_SITEMAP_URL))
    submit_parser.set_defaults(func=handle_submit_sitemap)

    inspect_parser = subparsers.add_parser("inspect", help="Inspect one or more URLs in the Search Console index.")
    inspect_parser.add_argument("--property-url", default=parser.get_default("property_url"))
    inspect_parser.add_argument("--url", action="append", help="A fully-qualified URL to inspect. Repeat as needed.")
    inspect_parser.add_argument("--urls-file", help="Text file containing one URL per line.")
    inspect_parser.add_argument("--from-sitemap", help="Load URLs from a sitemap or sitemap index.")
    inspect_parser.add_argument("--limit", type=int, default=5, help="Maximum number of URLs to inspect.")
    inspect_parser.add_argument("--language-code", default="en-US")
    inspect_parser.add_argument("--output", choices=("text", "json"), default="text")
    inspect_parser.set_defaults(func=handle_inspect)

    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    try:
        return args.func(args)
    except Exception as error:  # pragma: no cover - CLI error path
        print(json.dumps({"error": str(error), "command": args.command}, indent=2), file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
