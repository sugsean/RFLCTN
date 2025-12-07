import json
import shutil

path = '/Users/sugsean/.gemini/antigravity/playground/ionic-rocket/RFLCTN/public/articles.json'

# Backup first
shutil.copy(path, path + '.bak')

with open(path, 'r') as f:
    data = json.load(f)

# The last item is the one we just added (Levin)
# We want to reverse the order so newest is first?
# Wait, checking original order.
# First item was "20251207... neck anxiety".
# That's recent. 
# Last item (before I added) was "20251204...".
# So the list was NEWEST FIRST.
# I added mine to the END. So mine (Dec 7 18:15) is after Dec 4.
# This makes it out of order.

# Let's sort entire list by date descending (Newest first)
data.sort(key=lambda x: x.get('date', ''), reverse=True)

with open(path, 'w') as f:
    json.dump(data, f, indent=2)

print("Reordered articles successfully.")
