# Potato Designer development and QA

Scope confirmed by user: Potato Designer. Fix character layout overflow and motion-state defects; add local project-note draft recovery; verify real browser interactions at desktop and mobile sizes. No deployment in this task.

G1 PASS: task fields recorded in companion JSON. G2 PASS: scope and final review retained by primary agent. G3 PASS: frontend/QA/review domains. G4 PASS: powerful tasks are justified by ambiguous scope interpretation and final review; implementation includes coupled motion/accessibility state and storage failure behavior. G5 PASS: reversible local changes only.

Runtime note: primary session model is inherited and cannot be reassigned in place; routing preferences are recorded separately from execution. No extra agents required.

Verification: workspace check; browser checks for scene selection, pause/replay/reduced motion, dialog focus and Escape/backdrop, draft persistence and download contents, narrow viewports, console/network failures. Record final evidence in project QA.md.

Completed: layout and motion fixes, local draft recovery/clear, and narrow-screen work-card repair. Browser regression: 52 assertions passed across 320–1920px. Workspace check passed with one pre-existing dawn-store graph warning. Final evidence and limits: projects/potato-designer/QA.md. Deployment unchanged.
