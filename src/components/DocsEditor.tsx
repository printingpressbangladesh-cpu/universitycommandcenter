import { useEffect, useRef, useState } from "react";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Table as TableIcon,
  Eye,
  EyeOff,
  Columns,
  Grid,
  Printer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface DocsEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  noteId?: string;
}

export function DocsEditor({ value, onChange, placeholder, noteId }: DocsEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const lastValueRef = useRef<string>(value);
  const [showTableModal, setShowTableModal] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [pageSize, setPageSize] = useState<"A4" | "Letter" | "Full">("Full");

  // Focus and populate HTML when switching notes
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || "";
      lastValueRef.current = value || "";
    }
  }, [value, noteId]);

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      if (html !== lastValueRef.current) {
        lastValueRef.current = html;
        onChange(html);
      }
    }
  };

  const executeCommand = (command: string, arg = "") => {
    document.execCommand(command, false, arg);
    handleInput();
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const getActiveCell = (): HTMLTableCellElement | null => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;
    let node = selection.getRangeAt(0).startContainer;
    while (node && node !== document.body) {
      if (node.nodeName === "TD" || node.nodeName === "TH") {
        return node as HTMLTableCellElement;
      }
      node = node.parentNode as Node;
    }
    return null;
  };

  const insertTable = () => {
    if (tableRows < 1 || tableCols < 1) {
      toast.error("Rows and columns must be at least 1");
      return;
    }

    let tableHtml = `<table class="w-full border-collapse border border-border my-2 table-docs" style="border-style: solid; border-width: 1px;"><tbody>`;
    for (let r = 0; r < tableRows; r++) {
      tableHtml += `<tr>`;
      for (let c = 0; c < tableCols; c++) {
        tableHtml += `<td class="border border-border p-2 min-h-8 min-w-16 align-top" style="border-style: solid; border-width: 1px;">&nbsp;</td>`;
      }
      tableHtml += `</tr>`;
    }
    tableHtml += `</tbody></table><p>&nbsp;</p>`;

    executeCommand("insertHTML", tableHtml);
    setShowTableModal(false);
    toast.success("Table inserted");
  };

  const mergeRight = () => {
    const cell = getActiveCell();
    if (!cell) {
      toast.error("Place your cursor inside a table cell to merge");
      return;
    }
    const nextCell = cell.nextElementSibling as HTMLTableCellElement | null;
    if (!nextCell || (nextCell.nodeName !== "TD" && nextCell.nodeName !== "TH")) {
      toast.error("No cell directly to the right to merge with");
      return;
    }

    // Merge content
    const originalContent = cell.innerHTML.trim();
    const nextContent = nextCell.innerHTML.trim();
    cell.innerHTML =
      originalContent === "&nbsp;" || originalContent === ""
        ? nextContent
        : nextContent === "&nbsp;" || nextContent === ""
        ? originalContent
        : `${originalContent} ${nextContent}`;

    // Adjust colSpan
    const currentColSpan = cell.colSpan || 1;
    const nextColSpan = nextCell.colSpan || 1;
    cell.colSpan = currentColSpan + nextColSpan;

    // Remove next cell
    nextCell.remove();
    handleInput();
    toast.success("Cells merged horizontally");
  };

  const mergeDown = () => {
    const cell = getActiveCell();
    if (!cell) {
      toast.error("Place your cursor inside a table cell to merge");
      return;
    }
    const tr = cell.parentElement as HTMLTableRowElement | null;
    if (!tr) return;
    const table = tr.closest("table");
    if (!table) return;

    const cellIdx = cell.cellIndex;
    const nextTr = tr.nextElementSibling as HTMLTableRowElement | null;
    if (!nextTr) {
      toast.error("No row below to merge with");
      return;
    }

    const nextCell = nextTr.cells[cellIdx] as HTMLTableCellElement | null;
    if (!nextCell) {
      toast.error("No matching cell directly below to merge with");
      return;
    }

    // Merge content
    const originalContent = cell.innerHTML.trim();
    const nextContent = nextCell.innerHTML.trim();
    cell.innerHTML =
      originalContent === "&nbsp;" || originalContent === ""
        ? nextContent
        : nextContent === "&nbsp;" || nextContent === ""
        ? originalContent
        : `${originalContent} ${nextContent}`;

    // Adjust rowSpan
    const currentRowSpan = cell.rowSpan || 1;
    const nextRowSpan = nextCell.rowSpan || 1;
    cell.rowSpan = currentRowSpan + nextRowSpan;

    // Remove next cell
    nextCell.remove();
    handleInput();
    toast.success("Cells merged vertically");
  };

  const toggleTableOutline = () => {
    const cell = getActiveCell();
    if (!cell) {
      toast.error("Place your cursor inside a table cell to toggle outline");
      return;
    }
    const table = cell.closest("table");
    if (!table) return;

    if (table.classList.contains("table-no-outline")) {
      table.classList.remove("table-no-outline");
      toast.success("Table outlines shown");
    } else {
      table.classList.add("table-no-outline");
      toast.success("Table outlines hidden");
    }
    handleInput();
  };

  const exportPDF = () => {
    window.print();
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <style>{`
        .rich-editor-content {
          outline: none;
        }
        .rich-editor-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 16px 0;
        }
        .rich-editor-content td, .rich-editor-content th {
          border: 1px solid var(--border);
          padding: 10px;
          min-width: 60px;
          min-height: 35px;
        }
        .rich-editor-content table.table-no-outline td,
        .rich-editor-content table.table-no-outline th {
          border-color: transparent !important;
        }
        /* In editing mode, show a very faint guide border for outline-less tables */
        .rich-editor-content:focus table.table-no-outline td,
        .rich-editor-content:focus table.table-no-outline th {
          border: 1px dashed oklch(1 0 0 / 0.15) !important;
        }
        .rich-editor-content ul {
          list-style-type: disc;
          padding-left: 28px;
          margin: 12px 0;
        }
        .rich-editor-content ol {
          list-style-type: decimal;
          padding-left: 28px;
          margin: 12px 0;
        }
        .rich-editor-content p {
          margin: 8px 0;
        }
        .rich-editor-content h1 {
          font-size: 1.75em;
          font-weight: 700;
          margin-top: 1.2em;
          margin-bottom: 0.4em;
          line-height: 1.25;
        }
        .rich-editor-content h2 {
          font-size: 1.4em;
          font-weight: 600;
          margin-top: 1.1em;
          margin-bottom: 0.4em;
          line-height: 1.3;
        }
        .rich-editor-content h3 {
          font-size: 1.2em;
          font-weight: 600;
          margin-top: 1em;
          margin-bottom: 0.3em;
          line-height: 1.35;
        }

        /* Screen spacing scroll logic for paper pages */
        .docs-page-container {
          background-color: color-mix(in oklab, var(--secondary) 30%, transparent);
          border-radius: 1.5rem;
          padding: 2rem;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          overflow-y: auto;
          min-height: 60vh;
          border: 1px solid var(--border);
        }

        /* Print Override styles for exporting A4/Letter perfectly */
        @media print {
          body, html, #root, main, header, aside, section, nav, button, select, input, .rich-text-toolbar {
            visibility: hidden !important;
            background: none !important;
          }
          
          .print-area-wrapper, .print-area-wrapper *, .print-area-page, .print-area-page * {
            visibility: visible !important;
          }
          
          .print-area-wrapper {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
            overflow: visible !important;
          }

          .print-area-page {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-w: 100% !important;
            min-h: 100% !important;
            border: none !important;
            box-shadow: none !important;
            padding: 20mm !important;
            background: white !important;
            color: black !important;
          }
        }
      `}</style>

      {/* Rich Text Toolbar */}
      <div className="flex flex-wrap gap-1.5 p-2 rounded-2xl border border-border/60 bg-secondary/35 items-center justify-between rich-text-toolbar">
        <div className="flex flex-wrap gap-1.5 items-center">
          {/* Style actions */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => executeCommand("bold")}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => executeCommand("italic")}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => executeCommand("underline")}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            title="Underline"
          >
            <Underline className="h-4 w-4" />
          </Button>

          <select
            onChange={(e) => {
              executeCommand("formatBlock", e.target.value);
            }}
            value=""
            className="h-8 text-xs bg-secondary border border-border/60 rounded-xl px-2 text-muted-foreground focus:text-foreground outline-none cursor-pointer"
            title="Text Style"
          >
            <option value="" disabled hidden>Style</option>
            <option value="<p>">Normal Text</option>
            <option value="<h1>">Heading 1</option>
            <option value="<h2>">Heading 2</option>
            <option value="<h3>">Heading 3</option>
          </select>

          <div className="h-4 w-[1px] bg-border/60 mx-1" />

          {/* Lists */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => executeCommand("insertUnorderedList")}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => executeCommand("insertOrderedList")}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>

          <div className="h-4 w-[1px] bg-border/60 mx-1" />

          {/* Table actions */}
          <div className="relative">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowTableModal(!showTableModal)}
              className={`h-8 w-8 text-muted-foreground hover:text-foreground ${
                showTableModal ? "bg-secondary" : ""
              }`}
              title="Insert Table"
            >
              <TableIcon className="h-4 w-4" />
            </Button>

            {showTableModal && (
              <div className="absolute left-0 mt-2 z-50 p-4 rounded-2xl border border-border/80 bg-popover shadow-glow space-y-3 w-48 text-popover-foreground animate-fade-in-up">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-primary">Table Grid</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[10px]">Rows</Label>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      value={tableRows}
                      onChange={(e) => setTableRows(Number(e.target.value))}
                      className="h-7 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px]">Columns</Label>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      value={tableCols}
                      onChange={(e) => setTableCols(Number(e.target.value))}
                      className="h-7 text-xs"
                    />
                  </div>
                </div>
                <Button type="button" size="sm" className="w-full h-8 text-xs bg-gradient-primary text-primary-foreground" onClick={insertTable}>
                  Create Table
                </Button>
              </div>
            )}
          </div>

          <Button
            type="button"
            variant="ghost"
            onClick={mergeRight}
            className="h-8 text-xs text-muted-foreground hover:text-foreground px-2 flex items-center gap-1"
            title="Merge Cell Right"
          >
            <Columns className="h-3.5 w-3.5" /> Merge Right
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={mergeDown}
            className="h-8 text-xs text-muted-foreground hover:text-foreground px-2 flex items-center gap-1"
            title="Merge Cell Down"
          >
            <Grid className="h-3.5 w-3.5" /> Merge Down
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleTableOutline}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            title="Toggle Table Outline (Hide Borders)"
          >
            <EyeOff className="h-4 w-4" />
          </Button>
        </div>

        {/* Page Sizing & Export controls */}
        <div className="flex items-center gap-2">
          <select
            value={pageSize}
            onChange={(e) => setPageSize(e.target.value as "A4" | "Letter" | "Full")}
            className="h-8 text-xs bg-secondary border border-border/60 rounded-xl px-2 text-muted-foreground focus:text-foreground outline-none cursor-pointer"
          >
            <option value="Full">Full Width</option>
            <option value="A4">A4 Page</option>
            <option value="Letter">Letter Page</option>
          </select>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={exportPDF}
            className="h-8 text-xs gap-1.5 border-primary/40 text-primary hover:bg-primary/10 rounded-xl"
            title="Export as PDF / Print"
          >
            <Printer className="h-3.5 w-3.5" /> Export PDF
          </Button>
        </div>
      </div>

      {/* Editor Content Area wrapper */}
      <div className="docs-page-container print-area-wrapper">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onBlur={handleInput}
          className={`rich-editor-content focus:outline-none transition-all print-area-page ${
            pageSize === "A4"
              ? "bg-card text-foreground shadow-2xl p-[15mm] md:p-[20mm] w-[210mm] min-h-[297mm] border border-border/60 rounded-sm"
              : pageSize === "Letter"
              ? "bg-card text-foreground shadow-2xl p-[15mm] md:p-[20mm] w-[8.5in] min-h-[11in] border border-border/60 rounded-sm"
              : "w-full min-h-[50vh] p-2"
          }`}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}
