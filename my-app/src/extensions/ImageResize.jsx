// src/extensions/ImageResize.jsx
import Image from "@tiptap/extension-image";
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";


const CustomImageComponent = (props) => {
  const { node, updateAttributes, selected, } = props;
  const width = node.attrs.width || "auto";

  return (
    <NodeViewWrapper className="relative inline-flex " contentEditable={false}>

      <img
        src={node.attrs.src}
        alt={node.attrs.alt || ""}
        style={{ width }}
        className={`rounded-md ${selected ? "ring-2 ring-indigo-500" : ""}`}
      />
      {selected && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white shadow-lg rounded-lg border px-3 py-2 flex items-center space-x-2 z-50">
          <button
            onClick={() => updateAttributes({ width: "25%" })}
            className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
          >
            25%
          </button>
          <button
            onClick={() => updateAttributes({ width: "50%" })}
            className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
          >
            50%
          </button>
          <button
            onClick={() => updateAttributes({ width: "75%" })}
            className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
          >
            75%
          </button>
          <button
            onClick={() => updateAttributes({ width: "100%" })}
            className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
          >
            100%
          </button>
        </div>
      )}
    </NodeViewWrapper>
  );
};

export const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: "auto",
        parseHTML: (element) => element.getAttribute("width") || "auto",
        renderHTML: (attrs) => ({ width: attrs.width })
      },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(CustomImageComponent);
  },
});
