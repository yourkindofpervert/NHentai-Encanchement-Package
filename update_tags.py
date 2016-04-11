import argparse
import json
import os
import re

import requests
from bs4 import BeautifulSoup

arparse = argparse.ArgumentParser()
arparse.add_argument("-r", dest="refresh", action='store_true')
arparse.add_argument("-v", dest="verbose", action='store_true')
args = arparse.parse_args()
here = os.path.dirname(os.path.realpath(__file__))
save = {
    "t": {
        "17249": [5, "translated"],
        "29963": [5, "chinese"],
        "12227": [5, "english"],
        "6346": [5, "japanese"],
    },
    "k": ["tags", "characters", "parodies", "groups", "artists", "languages"]
}


def scrape(url, last_page):
    for page_number in range(1, last_page + 1):
        page = requests.get(url, params={"page": page_number})
        if page.status_code != 200:
            yield StopIteration
        if args.verbose:
            print("Getting data from {}".format(page.url))
        soup = BeautifulSoup(page.content, 'html.parser')
        for tag in soup.findAll("a", {"class": "tag"}):
            tag_name = re.sub(r'\(\d*\)$', '', tag.text.strip().replace(",", "")).strip()
            tag_id = int(str(tag['class'][-1]).replace('tag-', ''))
            yield (tag_name, tag_id,)


if not os.path.exists(os.path.join(here, "src", "tags.json")) or args.refresh:
    for index, thing in enumerate((("http://nhentai.net/tags/", 59),
                                   ("http://nhentai.net/characters/", 56),
                                   ("http://nhentai.net/parodies/", 19),
                                   ("http://nhentai.net/groups/", 80),
                                   ("http://nhentai.net/artists/", 102))):
        s = scrape(*thing)
        save["t"].update({str(tag_id): [index, tag_name] for tag_name, tag_id in s})

    with open(os.path.join(here, "src", "tags.json"), "wb") as f:
        f.write(json.dumps(save, sort_keys=True))
