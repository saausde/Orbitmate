// InputBox: 재사용 가능한 입력창 컴포넌트
import React from "react";

function InputBox({
  value,
  onChange,
  onSubmit,
  placeholder,
  inputClassName = "",
  formClassName = "",
  buttonClassName = "",
  disabled = false,
  autoFocus = false,
  inputRef,
  ...props
}) {
  // 엔터키로 전송
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && value.trim() !== "") {
      if (onSubmit) onSubmit(e);
    }
  };
  return (
    <form
      className={formClassName}
      onSubmit={onSubmit}
      autoComplete="off"
      style={{
        width: "100%",
        position: "relative",
        display: "flex",
        alignItems: "center",
      }}
    >
      <input
        ref={inputRef}
        className={inputClassName}
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        {...props}
      />
      {/*<button
        className={buttonClassName}
        type="submit"
        disabled={disabled || !value.trim()}
        aria-label="메시지 전송"
      >
        {props.children || <span style={{ display: "none" }}>전송</span>}
      </button>*/}
    </form>
  );
}

export default InputBox;
