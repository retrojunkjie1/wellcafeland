import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronRight } from "lucide-react";

export default function Sidebar({ isOpen, onClose, sections }) {
  // Lock body scroll when sidebar is open (mobile)
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
  }, [isOpen]);

  return (
    <div
      className={`fixed inset-0 z-50 transition ${
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      {/* Dim Background */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Sidebar Panel */}
      <aside
        className={`
          absolute left-0 top-0 h-full 
          w-[84%] sm:w-72 
          bg-[#05070C]/90 
          backdrop-blur-xl 
          border-r border-white/5 
          shadow-[4px_0_20px_-8px_rgba(0,0,0,0.6)]
          transform transition-transform duration-300 
          flex flex-col
          ${
            isOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-white/10 rounded-md flex items-center justify-center font-bold text-[11px]">
              WC
            </div>
            <div className="font-semibold tracking-wide text-[13px]">
              WELLNESSCAFE
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[11px] opacity-60 hover:opacity-100 transition"
          >
            Close
          </button>
        </div>

        {/* Scrollable Menu */}
        <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
          {sections?.map((section, idx) => (
            <SidebarSection section={section} key={idx} />
          ))}
        </div>
      </aside>
    </div>
  );
}

/* ----------------------------
   Section Component
----------------------------- */
function SidebarSection({ section }) {
  return (
    <div className="mt-4">
      {/* Section Title */}
      <h3 className="px-4 pb-2 text-[11px] font-semibold tracking-widest text-white/40 uppercase">
        {section.title}
      </h3>

      <ul className="flex flex-col gap-1">
        {section.items.map((item, idx) =>
          item.children ? (
            <SidebarFolder item={item} key={idx} />
          ) : (
            <SidebarItem item={item} key={idx} />
          )
        )}
      </ul>
    </div>
  );
}

/* ----------------------------
   Regular clickable item
----------------------------- */
function SidebarItem({ item }) {
  return (
    <Link
      to={item.to}
      className="flex items-center gap-2 px-4 py-2 text-[13px] hover:bg-white/5 transition rounded-lg"
      onClick={item.onClick}
    >
      {item.icon && <item.icon className="h-4 w-4 opacity-80" />}
      <span>{item.label}</span>
    </Link>
  );
}

/* ----------------------------
   Folder / expandable group
----------------------------- */
function SidebarFolder({ item }) {
  const [open, setOpen] = React.useState(false);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="group flex items-center justify-between w-full px-4 py-2 text-[13px] hover:bg-white/5 rounded-lg transition"
      >
        <div className="flex items-center gap-2">
          {item.icon && <item.icon className="h-4 w-4 opacity-80" />}
          <span>{item.label}</span>
        </div>

        {open ? (
          <ChevronDown className="h-3 w-3 opacity-40 group-hover:opacity-100 transition" />
        ) : (
          <ChevronRight className="h-3 w-3 opacity-40 group-hover:opacity-100 transition" />
        )}
      </button>

      {/* Child items */}
      {open && (
        <div className="ml-1 flex flex-col gap-[2px]">
          {item.children.map((child, idx) => (
            <Link
              key={idx}
              to={child.to}
              className="flex items-center gap-2 pl-6 pr-4 py-[6px] text-[12px] opacity-90 hover:opacity-100 hover:bg-white/5 transition rounded-md"
              onClick={child.onClick}
            >
              {child.icon && <child.icon className="h-3 w-3 opacity-60" />}
              <span>{child.label}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
