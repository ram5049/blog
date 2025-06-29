import React, { useState, useCallback } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const PostEditor = ({
  value,
  onChange,
  placeholder = "Start writing your post...",
}) => {
  const [editorHtml, setEditorHtml] = useState(value || "");

  const handleChange = useCallback(
    (html) => {
      setEditorHtml(html);
      onChange(html);
    },
    [onChange]
  );

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ script: "sub" }, { script: "super" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ direction: "rtl" }],
      [{ size: ["small", false, "large", "huge"] }],
      [{ color: [] }, { background: [] }],
      [{ font: [] }],
      [{ align: [] }],
      ["blockquote", "code-block"],
      ["link", "image", "video"],
      ["clean"],
    ],
    clipboard: {
      matchVisual: false,
    },
  };

  const formats = [
    "header",
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
    "video",
    "color",
    "background",
    "align",
    "script",
    "code-block",
    "direction",
  ];

  return (
    <div className="admin-editor-container">
      <ReactQuill
        theme="snow"
        value={editorHtml}
        onChange={handleChange}
        placeholder={placeholder}
        modules={modules}
        formats={formats}
        style={{
          height: "300px",
          marginBottom: "42px", // Account for toolbar height
        }}
      />
    </div>
  );
};

export default PostEditor;
