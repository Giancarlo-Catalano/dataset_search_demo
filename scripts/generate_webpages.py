#!/usr/bin/env python3
if keywords_raw:
keywords = [k.strip() for k in re.split(r'[;,|\n]+', keywords_raw) if k.strip()]
else:
keywords = []


abstract = str(row.get('abstract', '') or row.get('short_summary', '') or '')
location = str(row.get('location', '') or '')
accessibility = str(row.get('accessibility', '') or row.get('isAccessibleForFree', '') or '')
description_md = str(row.get('description_md', '') or '')
download_links = str(row.get('download_links', '') or '')
author = str(row.get('author', '') or '')
organisation = str(row.get('organisation', '') or '')


# Convert description markdown to HTML if possible; otherwise minimal escaping with paragraphs
if MD_AVAILABLE and description_md.strip():
description_html = markdown.markdown(description_md, extensions=['fenced_code', 'tables'])
else:
# very small fallback: escape and turn double newlines into paragraphs
esc = html.escape(description_md)
paragraphs = ''.join(f"<p>{p.replace('\n', '<br/>')}</p>" for p in esc.split('\n\n') if p.strip())
description_html = paragraphs or '<p></p>'


# create a simple HTML page
html_content = f"""
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{html.escape(name) or 'Dataset ' + code}</title>
<link rel="stylesheet" href="/style.css">
</head>
<body>
<main class="container">
<h1>{html.escape(name) or 'Dataset ' + code}</h1>
<p><strong>Dataset code:</strong> {code}</p>
<p><strong>Author / Organisation:</strong> {html.escape(author)} {(' — ' + html.escape(organisation)) if organisation else ''}</p>
<p><strong>Keywords:</strong> {', '.join(html.escape(k) for k in keywords)}</p>
<p><strong>Location:</strong> {html.escape(location)}</p>
<p><strong>Accessibility:</strong> {html.escape(accessibility)}</p>
<h2>Abstract</h2>
<p>{html.escape(abstract)}</p>


<h2>Long description</h2>
<div class="description">{description_html}</div>


<h2>Downloads / Links</h2>
<p>{html.escape(download_links)}</p>


<hr/>
<p><a href="/index.html">Back to index</a></p>
</main>
</body>
</html>
"""


page_path.write_text(html_content, encoding='utf-8')


# Build entry for JSON index
index_entry = {
'id': code,
'name': name,
'keywords': keywords,
'abstract': abstract,
'location': location,
'accessibility': accessibility,
'index': idx,
'link': f"{OUT_DIR.name}/{page_filename}",
}
index_list.append(index_entry)


# Write JSON index
INDEX_PATH.write_text(json.dumps(index_list, ensure_ascii=False, indent=2), encoding='utf-8')


print(f"Generated {len(index_list)} pages in '{OUT_DIR}' and index at '{INDEX_PATH}'")
