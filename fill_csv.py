import csv

input_file = 'server/data/med_H.csv'

output_file = 'server/data/med_H_filled.csv'

rows = []

therapeutic_groups = {}

with open(input_file, 'r', newline='', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        rows.append(row)
        therapeutic_class = row['therapeuticClass']
        if therapeutic_class not in therapeutic_groups:
            therapeutic_groups[therapeutic_class] = {'chemicalClass': {}, 'actionClass': {}}
        if row['chemicalClass'].strip():
            therapeutic_groups[therapeutic_class]['chemicalClass'][row['chemicalClass']] = therapeutic_groups[therapeutic_class]['chemicalClass'].get(row['chemicalClass'], 0) + 1
        if row['actionClass'].strip():
            therapeutic_groups[therapeutic_class]['actionClass'][row['actionClass']] = therapeutic_groups[therapeutic_class]['actionClass'].get(row['actionClass'], 0) + 1

modes = {}

for therapeutic_class, groups in therapeutic_groups.items():
    chemical_mode = max(groups['chemicalClass'], key=groups['chemicalClass'].get) if groups['chemicalClass'] else ''
    action_mode = max(groups['actionClass'], key=groups['actionClass'].get) if groups['actionClass'] else ''
    modes[therapeutic_class] = {'chemicalClass': chemical_mode, 'actionClass': action_mode}

filled_rows = []

for row in rows:
    if not row['chemicalClass'].strip():
        row['chemicalClass'] = modes.get(row['therapeuticClass'], {}).get('chemicalClass', '')
    if not row['actionClass'].strip():
        row['actionClass'] = modes.get(row['therapeuticClass'], {}).get('actionClass', '')
    filled_rows.append(row)

with open(output_file, 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=rows[0].keys())
    writer.writeheader()
    writer.writerows(filled_rows)

print('Filled CSV written to', output_file)
