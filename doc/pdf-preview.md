# Preview PDF service tasks with app-lib v8

This frontend supports the optional `taskId` and `dataElementId` parameters on
the app-lib v8 PDF preview API. It requires the matching backend support.

The PDF generator opens a URL containing the selected service task, and for a
subform PDF, its component and data element. The renderer uses that task's layout
set and the selected subform, even when the instance is on an earlier task.
Auto-generated PDFs can still summarize multiple tasks using the `task` query
parameters supplied by the backend.

When rendering a task other than the current process task, form data is read-only:
component effects, data writes, and legacy calculations cannot modify it. The
legacy PDF formatter endpoint is skipped because it only understands the current
task. Existing current-task previews and normal form navigation retain their
behavior.
