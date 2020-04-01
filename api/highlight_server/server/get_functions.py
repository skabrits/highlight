from pymongo import MongoClient
import pymongo as pm
from bson.objectid import ObjectId


def get_from_db(search, tags, status=None):
    """
    :param search: user input
    :param tags: tags
    :param status: list of statuses
    :return: matching docs of id, name, tags, status, path, etc.
    """
    if status is None:
        status = {"TRANSLATED", "NEED_CHECK", "WAITING_FOR_TRANSLATION"}
    client = MongoClient()
    db = client.highlight
    lang_storage = db.files_info
    search_set = set(search)
    hl = []
    for i in search.split(" "):
        hl.extend(i.split("_"))
    search_set_words = set(hl)
    search_tags = set(tags.split(","))
    matching_docs = list()
    for doc in lang_storage.find({"status": {"$in": ["TRANSLATED", "NEED_CHECK", "WAITING_FOR_TRANSLATION"]}}):
        doc_stat = doc["status"]
        relev = 0
        if doc_stat == "TRANSLATED":
            relev += 100
        elif doc_stat == "NEED_CHECK":
            relev += 50
        elif doc_stat == "WAITING_FOR_TRANSLATION":
            relev += 0
        doc_name_set = set(doc["name"])
        doc_tags_set = set(doc["tags"])
        doc_id = doc["number"]
        tag_inrsc = search_tags.intersection(doc_tags_set)
        name_inrsc = search_set.intersection(doc_name_set)

        if len(search_tags) > 0:
            if len(tag_inrsc) >= len(search_tags) * 0.8:
                relev += len(tag_inrsc) / len(search_tags) * 7

            if doc["lang"] in search_tags:
                relev += 4

        if len(search_set) > 0:
            if len(name_inrsc) >= 0.6 * len(doc_name_set):
                relev += len(name_inrsc) / len(doc_name_set) * 10

            if doc_id in search_set_words:
                relev += 8

        if relev > 0:
            matching_docs.append((relev, doc))

    return {"code": "OK", "document": list(d for n, d in sorted(matching_docs, key=lambda t: t[0], reverse=True) if d["status"] in status)[:50]}


def get_for_chief_from_db(search, tags):
    return get_from_db(search, tags, status={"NEED_CHECK"})


def get_users():
    client = MongoClient()
    db = client.highlight
    acc = db.accounts
    return {"code": "OK", "document": list(acc.find({"verified": False}))}


def get_docs_and_trans():
    client = MongoClient()
    db = client.highlight
    acc = db.accounts
    l_s = db.files_info
    return {"code": "OK", "document": {"documents": l_s.count_documents({"status": "WAITING_FOR_TRANSLATION"}), "translators": acc.count_documents({"status": {"$in": ["translator", "both"]}, "verified": True}), "translated documents": l_s.count_documents({"status": "TRANSLATED"})}}


def get_translators_stat():
    client = MongoClient()
    db = client.highlight
    acc = db.accounts
    return {"code": "OK", "document": list(acc.find({"status": {"$in": ["translator", "both"]}, "verified": True}))}


def get_file_stat():
    client = MongoClient()
    db = client.highlight
    l_s = db.files_info
    docs = []
    for t in l_s.find({"status": {"$in": ["TRANSLATED", "NEED_CHECK", "WAITING_FOR_TRANSLATION"]}}):
        if t["status"] in {"TRANSLATED", "NEED_CHECK"}:
            docs.append({"name": ["name"], "pieces info": {}, "status": t["status"], "importance": l_s.find_one({"name": t["name"], "number": t["number"], "lang": t["lang"], "status": "WAITING_FOR_TRANSLATION"})["importance"]})
        else:
            docs.append({"name": t["name"], "pieces info": {"done pieces": l_s.count_documents({"name": t["name"], "number": t["number"], "lang": t["lang"], "status": "PIECE", "translation status": "DONE"}), "all pieces": t["piece number"]}, "status": t["status"], "importance": t["importance"]})
    return {"code": "OK", "document": docs}


def test():
    client = MongoClient()
    db = client.highlight
    acc = db.accounts


if __name__ == '__main__':
    test()