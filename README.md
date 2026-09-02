= Tracer Spec Workflow — Complete Example

Spec-driven development workflow built on Antora Tracer.

This repository eats its own dog food: its requirements, design concepts, ADRs, changes, and workflow documentation are traceable items published by Antora.

**For a new project?** Start with https://github.com/rattermeyer/tracer-spec-minimal — the minimal template with an empty slate.

**To see a working example?** You're in the right place. This repository demonstrates the full workflow with self-tracing documentation.

== Purpose

Tracer Spec Workflow replaces OpenSpec's parallel artifact hierarchy with a single project knowledge base.

Durable artifacts are written as traceable Antora content:

* use cases
* requirements
* architecture decision records (ADRs)
* stable design concepts
* changes

Tasks are temporary execution guidance.
When planning and implementation are separated in time, a change plan may be externalized as an ordinary AsciiDoc file.

== Quick Start

=== Prerequisites

- Node.js 20+
- `antora-tracer` CLI installed and available on `PATH`
- Antora (installed via npm)

=== Install this template

[source,bash]
----
git clone https://github.com/rattermeyer/tracer-spec.git my-project
cd my-project
npm install
----

=== Validate the example graph

[source,bash]
----
node /path/to/antora-tracer/lib/src/cli.js validate -i docs --config traceability.yml
----

Expected output:

[source,text]
----
Validating requirements traceability...
No validation errors found
Summary: 10 items, 11 relationships
----

=== Customize for your project

1. Edit the project name and description in `README.md` and `antora.yml`.
2. Update `docs/*.adoc` with your own use cases, requirements, changes, and ADRs.
3. Adapt `traceability.yml` if you need additional roles or relationships.
4. Run validation regularly: `npm run validate`

=== Use the skills

Install the skills into your Pi agent or LiteLLM proxy:

[source,bash]
----
# Copy skills to your agent's skill directory
cp -r skills/* ~/.pi/agent/skills/

# Or register them with LiteLLM Skills Gateway
# (see each skill's SKILL.md for endpoint details)
----

Then trigger them in your workflow (see "See it in action" above).

=== Build the Antora site

[source,bash]
----
npm run build
# Output: ./build/site/index.html
----

This publishes your project documentation with traceability matrices and coverage reports.

== Install for AI agents

=== Pi

Add the skills to your Pi agent directory:

[source,bash]
----
cp -r skills/* ~/.pi/agent/skills/
----

Or install from a URL:

[source,bash]
----
pi skill-install https://github.com/rattermeyer/tracer-spec/tree/main/skills/explore-change
pi skill-install https://github.com/rattermeyer/tracer-spec/tree/main/skills/write-use-case
pi skill-install https://github.com/rattermeyer/tracer-spec/tree/main/skills/write-requirement
pi skill-install https://github.com/rattermeyer/tracer-spec/tree/main/skills/record-adr
pi skill-install https://github.com/rattermeyer/tracer-spec/tree/main/skills/review-design
pi skill-install https://github.com/rattermeyer/tracer-spec/tree/main/skills/plan-change
pi skill-install https://github.com/rattermeyer/tracer-spec/tree/main/skills/validate-traceability
----

Then use them as shown in "See it in action":

[source,bash]
----
pi explore-change "your feature idea"
----

=== Claude

Copy the skills into your Claude project context, or reference them as tools:

[source,text]
----
I have a specification workflow built on Antora Tracer.
Here are the available skills: <paste SKILL.md files>

My project is at <project-path>
My traceability config is at <path>/traceability.yml

When I ask you to "explore a change" or "write a requirement",
use the corresponding skill to modify the project documents.
Always validate with `antora-tracer validate` after changes.
----

Or upload the project repo directly to Claude and ask:

[source,text]
----
Use the Tracer Spec Workflow skills in /skills/ to help me explore and
specify my feature.

When I say "explore dark mode", create a change item.
When I say "write requirement", add to requirements.adoc.
Validate the graph after each change.
----

=== Codex (OpenAI)

Use the LiteLLM Skills Gateway to register the skills:

[source,bash]
----
# Start LiteLLM with the skills
litellm --config config.yaml

# Register tracer-spec skills
curl -X POST http://localhost:8000/skills/create \
  -H "Content-Type: application/json" \
  -d @skills/explore-change/SKILL.md
----

Or call the skills directly as function tools in your Codex prompt:

[source,text]
----
tools: [
  {
    "name": "explore_change",
    "description": "Initiate a change proposal",
    "parameters": {
      "change_name": "string",
      "motivation": "string",
      "scope": "string"
    }
  },
  ...
]
----

== Installation script

For quick setup on a new machine:

[source,bash]
----
#!/bin/bash
# setup-tracer-spec.sh

set -e

# Clone template
git clone https://github.com/rattermeyer/tracer-spec.git "${1:-.}/tracer-spec"
cd tracer-spec

# Install dependencies
npm install

# Install skills to Pi
cp -r skills/* ~/.pi/agent/skills/

# Validate the example
node /path/to/antora-tracer/lib/src/cli.js validate -i docs --config traceability.yml

echo "✅ Tracer Spec Workflow installed!"
echo "Run: pi explore-change 'your feature'"
----

Save as `setup-tracer-spec.sh`, make it executable, and run:

[source,bash]
----
chmod +x setup-tracer-spec.sh
./setup-tracer-spec.sh my-project
cd my-project/tracer-spec
----

== Repository structure

[source,text]
----
tracer-spec/
├── README.md
├── LICENSE
├── .gitignore
├── package.json
├── traceability.yml
├── antora-playbook.yml
├── docs/                         # project-level source documents
│   ├── requirements.adoc
│   ├── design.adoc
│   ├── adrs.adoc
│   ├── changes.adoc
│   └── use-cases.adoc
├── plans/                        # temporary, change-scoped execution plans
├── skills/                       # Agent Skills for the workflow
│   ├── explore-change/
│   ├── write-use-case/
│   ├── write-requirement/
│   ├── record-adr/
│   ├── review-design/
│   ├── plan-change/
│   └── validate-traceability/
└── examples/tracer/              # self-tracing Antora site
----

== Workflow

[source,text]
----
Exploration → Change → Use case → Requirement → ADR → Design concept → Plan → Implementation → Verification
----

The graph is the source of truth.
Git and pull requests provide review, authorization, and history.
The initial workflow validates status values and structural relationships without enforcing transitions.

== See it in action

[source,text]
----
You: pi explore-change "Add user authentication"
AI:  What's the intended outcome?
You: Users need to log in with email and password.

AI:  Created CHG-001 in docs/changes.adoc
     Ready to write use cases.

You: pi write-use-case CHG-001
AI:  Who is the primary actor?
You: A registered user.

AI:  What is their goal?
You: Log in to access their dashboard.

AI:  Created UC-001 in docs/use-cases.adoc
     Links to CHG-001.

You: pi write-requirement CHG-001
AI:  The system SHALL validate email and password against stored credentials.

AI:  Created REQ-001 in docs/requirements.adoc
     Addresses CHG-001.

You: pi record-adr CHG-001
AI:  What's the key decision?
You: Use bcrypt for password hashing.

AI:  Context: Need secure password storage
     Decision: bcrypt with cost factor 12
     Consequences: ~100ms per auth, acceptable security
     Created ADR-001 in docs/adrs.adoc
     Records CHG-001.

You: pi review-design CHG-001
AI:  Checking existing design concepts...
     No match. Create a new one?
You: Yes.

AI:  Created DES-001: Authentication design
     Accepted ADR-001.

You: pi plan-change CHG-001
AI:  Created plans/CHG-001.plan.adoc
     • Create User model with password field
     • Implement login endpoint
     • Add tests for credential validation
     • Update authentication documentation

You: pi validate-traceability
AI:  ✅ No validation errors
     • 1 change → 1 requirement
     • 1 ADR → 1 design concept
     • 6 relationships, all valid
     Ready to implement!
----

== Build

[source,bash]
----
npm run validate
npm run build
----
