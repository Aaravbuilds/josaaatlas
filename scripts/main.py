#!/usr/bin/env python3
"""
Download logos for all NITs, IITs, IIITs, and GFTIs.

Strategy: Use the Wikipedia `pageimages` API to get the representative image
(infobox logo) from each institute's Wikipedia article — no filename guessing.

Usage:
    pip install requests
    python3 download_institute_logos.py

Output folders:
    public/logos/nits/
    public/logos/iits/
    public/logos/iiits/
    public/logos/gftis/
"""

import os, sys, time, re
try:
    import requests
    from requests.adapters import HTTPAdapter
    from urllib3.util.retry import Retry
except ImportError:
    sys.exit("Install requests first:  pip install requests")

# ── Config ────────────────────────────────────────────────────────────────────
BASE_DIR   = "public/logos"
WP_API     = "https://en.wikipedia.org/w/api.php"
THUMB_SIZE = 500          # px — large enough for a clean logo
DELAY      = 0.7          # seconds between requests (be polite to Wikipedia)

DIRS = {
    "NIT":  os.path.join(BASE_DIR, "nits"),
    "IIT":  os.path.join(BASE_DIR, "iits"),
    "IIIT": os.path.join(BASE_DIR, "iiits"),
    "GFTI": os.path.join(BASE_DIR, "gftis"),
}

# ── Institute → Wikipedia article title ───────────────────────────────────────
# The Wikipedia title is what we pass to the pageimages API.
# It returns whatever image Wikipedia uses in the article infobox.
INSTITUTES = {
    "NIT": [
        ("NIT_Agartala",        "National Institute of Technology Agartala"),
        ("MNIT_Allahabad",      "Motilal Nehru National Institute of Technology Allahabad"),
        ("NIT_Arunachal",       "National Institute of Technology Arunachal Pradesh"),
        ("NIT_Calicut",         "National Institute of Technology Calicut"),
        ("NIT_Delhi",           "National Institute of Technology Delhi"),
        ("NIT_Durgapur",        "National Institute of Technology Durgapur"),
        ("NIT_Goa",             "National Institute of Technology Goa"),
        ("NIT_Hamirpur",        "National Institute of Technology Hamirpur"),
        ("MANIT_Bhopal",        "Maulana Azad National Institute of Technology"),
        ("MNIT_Jaipur",         "Malaviya National Institute of Technology Jaipur"),
        ("NIT_Jalandhar",       "Dr B R Ambedkar National Institute of Technology Jalandhar"),
        ("NIT_Jamshedpur",      "National Institute of Technology Jamshedpur"),
        ("NIT_Karnataka",       "National Institute of Technology Karnataka"),
        ("NIT_Kurukshetra",     "National Institute of Technology Kurukshetra"),
        ("NIT_Manipur",         "National Institute of Technology Manipur"),
        ("NIT_Meghalaya",       "National Institute of Technology Meghalaya"),
        ("NIT_Mizoram",         "National Institute of Technology Mizoram"),
        ("NIT_Nagaland",        "National Institute of Technology Nagaland"),
        ("VNIT_Nagpur",         "Visvesvaraya National Institute of Technology"),
        ("NIT_Patna",           "National Institute of Technology Patna"),
        ("NIT_Puducherry",      "National Institute of Technology Puducherry"),
        ("NIT_Raipur",          "National Institute of Technology Raipur"),
        ("NIT_Rourkela",        "National Institute of Technology Rourkela"),
        ("NIT_Sikkim",          "National Institute of Technology Sikkim"),
        ("NIT_Silchar",         "National Institute of Technology Silchar"),
        ("NIT_Srinagar",        "National Institute of Technology Srinagar"),
        ("SVNIT_Surat",         "Sardar Vallabhbhai National Institute of Technology Surat"),
        ("NIT_Trichy",          "National Institute of Technology, Tiruchirappalli"),
        ("NIT_Uttarakhand",     "National Institute of Technology Uttarakhand"),
        ("NIT_Andhra",          "National Institute of Technology Andhra Pradesh"),
        ("NIT_Warangal",        "National Institute of Technology Warangal"),
    ],
    "IIT": [
        ("IIT_BHU",             "Indian Institute of Technology (BHU) Varanasi"),
        ("IIT_Bhilai",          "Indian Institute of Technology Bhilai"),
        ("IIT_Bhubaneswar",     "Indian Institute of Technology Bhubaneswar"),
        ("IIT_Bombay",          "Indian Institute of Technology Bombay"),
        ("IIT_Delhi",           "Indian Institute of Technology Delhi"),
        ("IIT_Dharwad",         "Indian Institute of Technology Dharwad"),
        ("IIT_Gandhinagar",     "Indian Institute of Technology Gandhinagar"),
        ("IIT_Goa",             "Indian Institute of Technology Goa"),
        ("IIT_Guwahati",        "Indian Institute of Technology Guwahati"),
        ("IIT_Hyderabad",       "Indian Institute of Technology Hyderabad"),
        ("IIT_Indore",          "Indian Institute of Technology Indore"),
        ("IIT_ISM",             "Indian Institute of Technology (ISM) Dhanbad"),
        ("IIT_Jammu",           "Indian Institute of Technology Jammu"),
        ("IIT_Jodhpur",         "Indian Institute of Technology Jodhpur"),
        ("IIT_Kanpur",          "Indian Institute of Technology Kanpur"),
        ("IIT_Kharagpur",       "Indian Institute of Technology Kharagpur"),
        ("IIT_Madras",          "Indian Institute of Technology Madras"),
        ("IIT_Mandi",           "Indian Institute of Technology Mandi"),
        ("IIT_Palakkad",        "Indian Institute of Technology Palakkad"),
        ("IIT_Patna",           "Indian Institute of Technology Patna"),
        ("IIT_Roorkee",         "Indian Institute of Technology Roorkee"),
        ("IIT_Ropar",           "Indian Institute of Technology Ropar"),
        ("IIT_Tirupati",        "Indian Institute of Technology Tirupati"),
    ],
    "IIIT": [
        ("IIIT_Allahabad",          "Indian Institute of Information Technology Allahabad"),
        ("IIITDM_Jabalpur",         "Indian Institute of Information Technology, Design and Manufacturing, Jabalpur"),
        ("IIITDM_Kancheepuram",     "Indian Institute of Information Technology, Design and Manufacturing, Kancheepuram"),
        ("IIIT_Guwahati",           "Indian Institute of Information Technology Guwahati"),
        ("IIIT_Kalyani",            "Indian Institute of Information Technology Kalyani"),
        ("IIIT_Kota",               "Indian Institute of Information Technology Kota"),
        ("IIIT_Kurnool",            "Indian Institute of Information Technology Kurnool"),
        ("IIIT_Lucknow",            "Indian Institute of Information Technology Lucknow"),
        ("IIIT_Manipur",            "Indian Institute of Information Technology Manipur"),
        ("IIIT_Nagpur",             "Indian Institute of Information Technology Nagpur"),
        ("IIIT_Pune",               "Indian Institute of Information Technology Pune"),
        ("IIIT_Ranchi",             "Indian Institute of Information Technology Ranchi"),
        ("IIIT_Sonepat",            "Indian Institute of Information Technology Sonepat"),
        ("IIIT_Sri_City",           "Indian Institute of Information Technology Sri City"),
        ("IIIT_Una",                "Indian Institute of Information Technology Una"),
        ("IIIT_Vadodara",           "Indian Institute of Information Technology Vadodara"),
        ("IIIT_Bhagalpur",          "Indian Institute of Information Technology Bhagalpur"),
        ("IIIT_Bhopal",             "Indian Institute of Information Technology Bhopal"),
        ("IIIT_Dharwad",            "Indian Institute of Information Technology Dharwad"),
        ("IIIT_Agartala",           "Indian Institute of Information Technology Agartala"),
        ("IIIT_Raichur",            "Indian Institute of Information Technology Raichur"),
        ("IIIT_Surat",              "Indian Institute of Information Technology Surat"),
        ("IIIT_Tiruchirappalli",    "Indian Institute of Information Technology Tiruchirappalli"),
        ("IIIT_Kolkata",            "Indian Institute of Information Technology Kolkata"),
        ("IIITDM_Kurnool",          "Indian Institute of Information Technology, Design and Manufacturing, Kurnool"),
        ("IIIT_Srirangam",          "Indian Institute of Information Technology Srirangam"),
    ],
    "GFTI": [
        ("IIEST_Shibpur",       "IIEST Shibpur"),
        ("BIT_Mesra",           "Birla Institute of Technology, Mesra"),
        ("ICT_Mumbai",          "Institute of Chemical Technology"),
        ("IIT_ISM_Dhanbad",     "Indian Institute of Technology (ISM) Dhanbad"),
        ("SPA_Bhopal",          "School of Planning and Architecture, Bhopal"),
        ("SPA_Delhi",           "School of Planning and Architecture, New Delhi"),
        ("SPA_Vijayawada",      "School of Planning and Architecture, Vijayawada"),
        ("SLIET",               "Sant Longowal Institute of Engineering and Technology"),
        ("Assam_Univ",          "Assam University"),
        ("Tezpur_Univ",         "Tezpur University"),
        ("Mizoram_Univ",        "Mizoram University"),
        ("Tripura_Univ",        "Tripura University"),
        ("Nagaland_Univ",       "Nagaland University"),
        ("Manipur_Univ",        "Manipur University"),
        ("Pondicherry_Univ",    "Pondicherry University"),
        ("NIFFT_Ranchi",        "National Institute of Foundry and Forge Technology"),
        ("CUJ_Jharkhand",       "Central University of Jharkhand"),
        ("GSITS_Indore",        "Shri Govindram Seksaria Institute of Technology and Science"),
        ("PEC_Chandigarh",      "Punjab Engineering College"),
        ("Gati_Shakti_Univ",    "Gati Shakti Vishwavidyalaya"),
        ("GKV_Haridwar",        "Gurukul Kangri University"),
        ("BIT_Sindri",          "Birla Institute of Technology, Sindri"),
        ("Rajiv_Gandhi_Univ",   "Rajiv Gandhi University"),
        ("Sikkim_Univ",         "Sikkim University"),
        ("IGNOU",               "Indira Gandhi National Open University"),
        ("NIT_Andaman",         "National Institute of Technology, Andaman and Nicobar Islands"),
    ],
}

# ── HTTP session ───────────────────────────────────────────────────────────────
def make_session():
    s = requests.Session()
    retry = Retry(total=4, backoff_factor=1.5,
                  status_forcelist=[429, 500, 502, 503, 504])
    s.mount("https://", HTTPAdapter(max_retries=retry))
    s.headers.update({
        "User-Agent": (
            "InstituteLogoBot/3.0 "
            "(educational project; fetches Wikipedia infobox images)"
        )
    })
    return s


def get_pageimage_url(session, wp_title: str, thumb_size: int) -> tuple[str | None, str | None]:
    """
    Call the Wikipedia pageimages API for wp_title.
    Returns (direct_original_url, thumbnail_url) or (None, None) on failure.

    We ask for a large thumbnail so SVG logos are rendered to PNG,
    and also request the original URL for raster images.
    """
    params = {
        "action":       "query",
        "titles":       wp_title,
        "prop":         "pageimages",
        "pithumbsize":  thumb_size,
        "pilicense":    "any",
        "format":       "json",
        "redirects":    1,
    }
    try:
        r = session.get(WP_API, params=params, timeout=15)
        r.raise_for_status()
        pages = r.json()["query"]["pages"]
        for page in pages.values():
            thumb = page.get("thumbnail", {})
            if thumb:
                # thumbnail.source is always a direct CDN URL (PNG even for SVG)
                return thumb.get("source"), thumb.get("source")
    except Exception as e:
        print(f"    ⚠  API error: {e}")
    return None, None


def infer_ext(url: str) -> str:
    """Infer file extension from CDN URL (strip query string, size suffix)."""
    # URLs look like: .../320px-Logo.png  or  .../Logo.jpg
    path = url.split("?")[0]
    # strip thumbnail size prefix like '320px-'
    basename = re.sub(r'^\d+px-', '', os.path.basename(path))
    ext = os.path.splitext(basename)[1].lower()
    return ext if ext in {".png", ".jpg", ".jpeg", ".svg", ".gif"} else ".png"


def download(session, url: str, dest: str) -> bool:
    try:
        with session.get(url, stream=True, timeout=30) as r:
            r.raise_for_status()
            with open(dest, "wb") as f:
                for chunk in r.iter_content(65536):
                    f.write(chunk)
        return True
    except Exception as e:
        print(f"    ✗  Download failed: {e}")
        if os.path.exists(dest):
            os.remove(dest)
        return False


# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    for d in DIRS.values():
        os.makedirs(d, exist_ok=True)

    session = make_session()
    totals  = {"ok": 0, "skip": 0, "fail": 0}
    failed  = []

    for category, institutes in INSTITUTES.items():
        out_dir = DIRS[category]
        print(f"\n{'─'*66}")
        print(f"  {category}s — {len(institutes)} institutes → {out_dir}")
        print(f"{'─'*66}")

        for short_name, wp_title in institutes:
            # Check if any file with this stem already exists
            existing = [f for f in os.listdir(out_dir)
                        if os.path.splitext(f)[0] == short_name]
            if existing:
                print(f"  [EXISTS] {existing[0]}")
                totals["ok"] += 1
                continue

            print(f"  ↓  {short_name}  ←  Wikipedia: {wp_title!r}")
            url, _ = get_pageimage_url(session, wp_title, THUMB_SIZE)

            if not url:
                print(f"    ✗  No image found on Wikipedia — check article title")
                totals["fail"] += 1
                failed.append(f"{category} / {short_name}  (title: {wp_title!r})")
                time.sleep(DELAY)
                continue

            ext  = infer_ext(url)
            dest = os.path.join(out_dir, short_name + ext)

            ok = download(session, url, dest)
            if ok:
                kb = os.path.getsize(dest) / 1024
                print(f"    ✔  {short_name}{ext}  ({kb:.1f} KB)")
                totals["ok"] += 1
            else:
                totals["fail"] += 1
                failed.append(f"{category} / {short_name}")

            time.sleep(DELAY)

    # ── Summary ───────────────────────────────────────────────────────────────
    total = totals["ok"] + totals["fail"] + totals["skip"]
    print(f"\n{'═'*66}")
    print(f"  Finished {total} institutes.")
    print(f"  ✔  {totals['ok']} downloaded / already present")
    print(f"  ✗  {totals['fail']} failed")
    print(f"  Logos saved under: {os.path.abspath(BASE_DIR)}/")
    if failed:
        print(f"\n  Failed (fix Wikipedia title in INSTITUTES dict and re-run):")
        for f in failed:
            print(f"    • {f}")
    print(f"{'═'*66}\n")
    sys.exit(1 if totals["fail"] else 0)


if __name__ == "__main__":
    main()