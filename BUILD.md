= Build Report

== Validation

✅ **All traceability items validated successfully**

```
Validating requirements traceability...
No validation errors found
Summary: 10 items, 11 relationships
```

=== Statistics

[width=100%, cols="20h,30a"]
|===
| Role | Count
| adr | 2
| change | 1
| design_concept | 2
| requirement | 4
| use_case | 1
|===

[width=100%, cols="20h,30a"]
|===
| Relationship type | Count
| records | 2
| leads_to | 3
| addresses | 6
|===

=== Coverage

All roles represented with complete traceability chain:

```
UC-001 ──leads_to──→ REQ-001
                      ↓ ↑ ↓
                  REQ-002, REQ-003, REQ-004
                      ↓
CHG-001 ──addresses──→ REQ-001, REQ-002, REQ-003, REQ-004
         ────────────↓
         ──recorded_by── ADR-001, ADR-002
                           ↓
                        ──leads_to──→ DES-001, DES-002
                                         ↓
                                    ──addresses──→ REQ-002
```

== Antora Build

⚠️  **UI bundle download failed** (network/CDN access issue)

The traceability extension loads and validates successfully.
The site build is blocked by UI bundle download, not by content or configuration issues.

The self-tracing example site requires network access to download Antora's UI bundle.
This is infrastructure-level, not content-level.

Workaround: provide the UI bundle via local file or build cache.

## Next Steps

1. Resolve UI bundle download (network routing or alternative CDN).
2. Build and publish the site.
3. Test the skills against the validated graph.
