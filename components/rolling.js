import React from "react";

const Rolling = (w, h, color, marginAuto) => (<svg
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    style={{
        margin: marginAuto ? "0" : "auto", display: "block", shapeRendering: "auto",
    }}
    width={w}
    height={h}
    viewBox="0 0 100 100"
    preserveAspectRatio="xMidYMid"
>
    <circle
        cx="50"
        cy="50"
        fill="none"
        stroke={color}
        strokeWidth="6"
        r="28"
        strokeDasharray="110 40"
        style={{
            animation: "rotate 1s infinite", transformOrigin: "50% 50%", strokeLinecap: "round",
        }}
    />
    <style>
        {`
                @keyframes rotate {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                    }
                  `}
    </style>
</svg>);

export default Rolling;