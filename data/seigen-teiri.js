/* 正弦定理：元教材の穴埋め手順データをそのまま移植 */
window.DATA_SEIGEN = [
 {
  "name": "問題1",
  "given": "三角形ABCにおいて、角A = 45度、角B = 60度、b = 6 のとき、辺 a の長さを求めよ。",
  "target": "",
  "lines": [
   [
    {
     "frac": [
      [
       "a"
      ],
      [
       "sin45°"
      ]
     ]
    },
    " = ",
    {
     "frac": [
      [
       {
        "a": "6",
        "kind": "text"
       }
      ],
      [
       {
        "a": "sin60°",
        "kind": "text"
       }
      ]
     ]
    }
   ],
   [
    "a = ",
    {
     "frac": [
      [
       "6"
      ],
      [
       "sin60°"
      ]
     ]
    },
    " × sin45°"
   ],
   [
    "a = 6 ÷ sin60° × sin45°"
   ],
   [
    "sin45° = ",
    {
     "frac": [
      [
       "1"
      ],
      [
       "√2"
      ]
     ]
    },
    "、sin60° = ",
    {
     "frac": [
      [
       "√3"
      ],
      [
       "2"
      ]
     ]
    },
    "<br>",
    "を使うと"
   ],
   [
    "a = 6 ÷ ",
    {
     "frac": [
      [
       {
        "a": "√3",
        "kind": "text"
       }
      ],
      [
       {
        "a": "2",
        "kind": "text"
       }
      ]
     ]
    },
    " × ",
    {
     "frac": [
      [
       {
        "a": "1",
        "kind": "text"
       }
      ],
      [
       {
        "a": "√2",
        "kind": "text"
       }
      ]
     ]
    }
   ],
   [
    "a = 6 × ",
    {
     "frac": [
      [
       {
        "a": "2",
        "kind": "text"
       }
      ],
      [
       {
        "a": "√3",
        "kind": "text"
       }
      ]
     ]
    },
    " × ",
    {
     "frac": [
      [
       {
        "a": "1",
        "kind": "text"
       }
      ],
      [
       {
        "a": "√2",
        "kind": "text"
       }
      ]
     ]
    }
   ],
   [],
   [
    "a = ",
    {
     "frac": [
      [
       {
        "a": "12",
        "kind": "text"
       }
      ],
      [
       {
        "a": "√6",
        "kind": "text"
       }
      ]
     ]
    }
   ],
   [
    "分母にルートがあるので有理化すると、"
   ],
   [
    "a = ",
    {
     "frac": [
      [
       "12"
      ],
      [
       "√6"
      ]
     ]
    },
    " × ",
    {
     "frac": [
      [
       {
        "a": "√6",
        "kind": "text"
       }
      ],
      [
       {
        "a": "√6",
        "kind": "text"
       }
      ]
     ]
    },
    "　（同じルートを分母と分子にかける）"
   ],
   [
    "a = ",
    {
     "frac": [
      [
       {
        "a": "12√6",
        "kind": "text"
       }
      ],
      [
       {
        "a": "6",
        "kind": "text"
       }
      ]
     ]
    }
   ],
   [
    "a = ",
    {
     "a": "2√6",
     "kind": "text"
    }
   ]
  ],
  "extras": [
   "3√6",
   "4√6"
  ],
  "hint": "正弦定理　a / sin A = b / sin B = c / sin C",
  "summary": "正弦定理を使い、分母のルートは有理化して答えを整えます。"
 },
 {
  "name": "問題2",
  "given": "三角形ABCにおいて、角A = 30度、角C = 45度、c = 4 のとき、辺 a の長さを求めよ。",
  "target": "",
  "lines": [
   [
    {
     "frac": [
      [
       "a"
      ],
      [
       {
        "a": "sin30°",
        "kind": "text"
       }
      ]
     ]
    },
    " = ",
    {
     "frac": [
      [
       {
        "a": "4",
        "kind": "text"
       }
      ],
      [
       {
        "a": "sin45°",
        "kind": "text"
       }
      ]
     ]
    }
   ],
   [
    "a = ",
    {
     "frac": [
      [
       {
        "a": "4",
        "kind": "text"
       }
      ],
      [
       {
        "a": "sin45°",
        "kind": "text"
       }
      ]
     ]
    },
    " × ",
    {
     "a": "sin30°",
     "kind": "text"
    }
   ],
   [
    "a = ",
    {
     "a": "4",
     "kind": "text"
    },
    " ÷ ",
    {
     "a": "sin45°",
     "kind": "text"
    },
    " × ",
    {
     "a": "sin30°",
     "kind": "text"
    }
   ],
   [
    "sin30° = ",
    {
     "frac": [
      [
       {
        "a": "1",
        "kind": "text"
       }
      ],
      [
       {
        "a": "2",
        "kind": "text"
       }
      ]
     ]
    },
    "、sin45° = ",
    {
     "frac": [
      [
       {
        "a": "1",
        "kind": "text"
       }
      ],
      [
       {
        "a": "√2",
        "kind": "text"
       }
      ]
     ]
    },
    "<br>",
    "を使うと"
   ],
   [
    "a = 4 ÷ ",
    {
     "frac": [
      [
       "1"
      ],
      [
       "√2"
      ]
     ]
    },
    " × ",
    {
     "frac": [
      [
       "1"
      ],
      [
       "2"
      ]
     ]
    }
   ],
   [],
   [
    "a = 4 × ",
    {
     "frac": [
      [
       {
        "a": "√2",
        "kind": "text"
       }
      ],
      [
       {
        "a": "1",
        "kind": "text"
       }
      ]
     ]
    },
    " × ",
    {
     "frac": [
      [
       {
        "a": "1",
        "kind": "text"
       }
      ],
      [
       {
        "a": "2",
        "kind": "text"
       }
      ]
     ]
    }
   ],
   [
    "a = ",
    {
     "frac": [
      [
       {
        "a": "4√2",
        "kind": "text"
       }
      ],
      [
       {
        "a": "2",
        "kind": "text"
       }
      ]
     ]
    }
   ],
   [
    "a = ",
    {
     "a": "2√2",
     "kind": "text"
    }
   ]
  ],
  "extras": [
   "3√2"
  ],
  "hint": "正弦定理　a / sin A = b / sin B = c / sin C",
  "summary": "正弦定理を使い、分母のルートは有理化して答えを整えます。"
 },
 {
  "name": "問題3",
  "given": "三角形ABCにおいて、角A = 60度、角B = 45度、a = 8 のとき、辺 b の長さを求めよ。",
  "target": "",
  "lines": [
   [
    {
     "frac": [
      [
       "b"
      ],
      [
       {
        "a": "sin45°",
        "kind": "text"
       }
      ]
     ]
    },
    " = ",
    {
     "frac": [
      [
       {
        "a": "8",
        "kind": "text"
       }
      ],
      [
       {
        "a": "sin60°",
        "kind": "text"
       }
      ]
     ]
    }
   ],
   [
    "b = ",
    {
     "frac": [
      [
       {
        "a": "8",
        "kind": "text"
       }
      ],
      [
       {
        "a": "sin60°",
        "kind": "text"
       }
      ]
     ]
    },
    " × ",
    {
     "a": "sin45°",
     "kind": "text"
    }
   ],
   [
    "b = ",
    {
     "a": "8",
     "kind": "text"
    },
    " ÷ ",
    {
     "a": "sin60°",
     "kind": "text"
    },
    " × ",
    {
     "a": "sin45°",
     "kind": "text"
    }
   ],
   [
    "sin60° = ",
    {
     "frac": [
      [
       {
        "a": "√3",
        "kind": "text"
       }
      ],
      [
       {
        "a": "2",
        "kind": "text"
       }
      ]
     ]
    },
    "、sin45° = ",
    {
     "frac": [
      [
       {
        "a": "1",
        "kind": "text"
       }
      ],
      [
       {
        "a": "√2",
        "kind": "text"
       }
      ]
     ]
    },
    "<br>",
    "を使うと"
   ],
   [
    "b = 8 ÷ ",
    {
     "frac": [
      [
       "√3"
      ],
      [
       "2"
      ]
     ]
    },
    " × ",
    {
     "frac": [
      [
       "1"
      ],
      [
       "√2"
      ]
     ]
    }
   ],
   [
    "b = 8 × ",
    {
     "frac": [
      [
       {
        "a": "2",
        "kind": "text"
       }
      ],
      [
       {
        "a": "√3",
        "kind": "text"
       }
      ]
     ]
    },
    " × ",
    {
     "frac": [
      [
       "1"
      ],
      [
       "√2"
      ]
     ]
    }
   ],
   [],
   [
    "b = ",
    {
     "frac": [
      [
       {
        "a": "16",
        "kind": "text"
       }
      ],
      [
       {
        "a": "√6",
        "kind": "text"
       }
      ]
     ]
    }
   ],
   [
    "分母にルートがあるので有理化すると、"
   ],
   [
    "b = ",
    {
     "frac": [
      [
       "16"
      ],
      [
       "√6"
      ]
     ]
    },
    " × ",
    {
     "frac": [
      [
       {
        "a": "√6",
        "kind": "text"
       }
      ],
      [
       {
        "a": "√6",
        "kind": "text"
       }
      ]
     ]
    },
    "　（同じルートを分母と分子にかける）"
   ],
   [
    "b = ",
    {
     "frac": [
      [
       {
        "a": "16√6",
        "kind": "text"
       }
      ],
      [
       {
        "a": "6",
        "kind": "text"
       }
      ]
     ]
    }
   ],
   [
    "b = ",
    {
     "a": "8√6/3",
     "kind": "text"
    }
   ]
  ],
  "extras": [
   {
    "type": "fraction",
    "numerator": "8√6",
    "denominator": "3"
   },
   {
    "type": "fraction",
    "numerator": "4√6",
    "denominator": "3"
   },
   {
    "type": "fraction",
    "numerator": "16√6",
    "denominator": "3"
   },
   {
    "type": "fraction",
    "numerator": "2√6",
    "denominator": "3"
   }
  ],
  "hint": "正弦定理　a / sin A = b / sin B = c / sin C",
  "summary": "正弦定理を使い、分母のルートは有理化して答えを整えます。"
 },
 {
  "name": "問題4",
  "given": "三角形ABCにおいて、角A = 30度、角B = 60度、b = 6 のとき、辺 a の長さを求めよ。",
  "target": "",
  "lines": [
   [
    {
     "frac": [
      [
       "a"
      ],
      [
       {
        "a": "sin30°",
        "kind": "text"
       }
      ]
     ]
    },
    " = ",
    {
     "frac": [
      [
       {
        "a": "6",
        "kind": "text"
       }
      ],
      [
       {
        "a": "sin60°",
        "kind": "text"
       }
      ]
     ]
    }
   ],
   [
    "a = ",
    {
     "frac": [
      [
       {
        "a": "6",
        "kind": "text"
       }
      ],
      [
       {
        "a": "sin60°",
        "kind": "text"
       }
      ]
     ]
    },
    " × ",
    {
     "a": "sin30°",
     "kind": "text"
    }
   ],
   [
    "a = ",
    {
     "a": "6",
     "kind": "text"
    },
    " ÷ ",
    {
     "a": "sin60°",
     "kind": "text"
    },
    " × ",
    {
     "a": "sin30°",
     "kind": "text"
    }
   ],
   [
    "sin30° = ",
    {
     "frac": [
      [
       {
        "a": "1",
        "kind": "text"
       }
      ],
      [
       {
        "a": "2",
        "kind": "text"
       }
      ]
     ]
    },
    "、sin60° = ",
    {
     "frac": [
      [
       {
        "a": "√3",
        "kind": "text"
       }
      ],
      [
       {
        "a": "2",
        "kind": "text"
       }
      ]
     ]
    },
    "<br>",
    "を使うと"
   ],
   [
    "a = 6 ÷ ",
    {
     "frac": [
      [
       "√3"
      ],
      [
       "2"
      ]
     ]
    },
    " × ",
    {
     "frac": [
      [
       "1"
      ],
      [
       "2"
      ]
     ]
    }
   ],
   [
    "a = 6 × ",
    {
     "frac": [
      [
       {
        "a": "2",
        "kind": "text"
       }
      ],
      [
       {
        "a": "√3",
        "kind": "text"
       }
      ]
     ]
    },
    " × ",
    {
     "frac": [
      [
       {
        "a": "1",
        "kind": "text"
       }
      ],
      [
       {
        "a": "2",
        "kind": "text"
       }
      ]
     ]
    }
   ],
   [],
   [
    "a = ",
    {
     "frac": [
      [
       "6"
      ],
      [
       "√3"
      ]
     ]
    }
   ],
   [
    "分母にルートがあるので有理化すると、"
   ],
   [
    "a = ",
    {
     "frac": [
      [
       "6"
      ],
      [
       "√3"
      ]
     ]
    },
    " × ",
    {
     "frac": [
      [
       {
        "a": "√3",
        "kind": "text"
       }
      ],
      [
       {
        "a": "√3",
        "kind": "text"
       }
      ]
     ]
    },
    "　（同じルートを分母と分子にかける）"
   ],
   [
    "a = ",
    {
     "frac": [
      [
       {
        "a": "6√3",
        "kind": "text"
       }
      ],
      [
       "3"
      ]
     ]
    }
   ],
   [
    "a = ",
    {
     "a": "2√3",
     "kind": "text"
    }
   ]
  ],
  "extras": [
   "3√3"
  ],
  "hint": "正弦定理　a / sin A = b / sin B = c / sin C",
  "summary": "正弦定理を使い、分母のルートは有理化して答えを整えます。"
 },
 {
  "name": "問題5",
  "given": "三角形ABCにおいて、角B = 60度、角C = 45度、b = 12 のとき、辺 c の長さを求めよ。",
  "target": "",
  "lines": [
   [
    {
     "frac": [
      [
       "c"
      ],
      [
       {
        "a": "sin45°",
        "kind": "text"
       }
      ]
     ]
    },
    " = ",
    {
     "frac": [
      [
       {
        "a": "12",
        "kind": "text"
       }
      ],
      [
       {
        "a": "sin60°",
        "kind": "text"
       }
      ]
     ]
    }
   ],
   [
    "c = ",
    {
     "frac": [
      [
       {
        "a": "12",
        "kind": "text"
       }
      ],
      [
       {
        "a": "sin60°",
        "kind": "text"
       }
      ]
     ]
    },
    " × ",
    {
     "a": "sin45°",
     "kind": "text"
    }
   ],
   [
    "c = ",
    {
     "a": "12",
     "kind": "text"
    },
    " ÷ ",
    {
     "a": "sin60°",
     "kind": "text"
    },
    " × ",
    {
     "a": "sin45°",
     "kind": "text"
    }
   ],
   [
    "c = ",
    {
     "a": "12",
     "kind": "text"
    },
    " ÷ ",
    {
     "frac": [
      [
       {
        "a": "√3",
        "kind": "text"
       }
      ],
      [
       {
        "a": "2",
        "kind": "text"
       }
      ]
     ]
    },
    " × ",
    {
     "frac": [
      [
       {
        "a": "1",
        "kind": "text"
       }
      ],
      [
       {
        "a": "√2",
        "kind": "text"
       }
      ]
     ]
    }
   ],
   [
    "c = 12 × ",
    {
     "frac": [
      [
       {
        "a": "2",
        "kind": "text"
       }
      ],
      [
       {
        "a": "√3",
        "kind": "text"
       }
      ]
     ]
    },
    " × ",
    {
     "frac": [
      [
       {
        "a": "1",
        "kind": "text"
       }
      ],
      [
       {
        "a": "√2",
        "kind": "text"
       }
      ]
     ]
    }
   ],
   [
    "c = ",
    {
     "frac": [
      [
       {
        "a": "24",
        "kind": "text"
       }
      ],
      [
       {
        "a": "√6",
        "kind": "text"
       }
      ]
     ]
    }
   ],
   [],
   [
    "分母にルートがあるので有理化すると、"
   ],
   [
    "c = ",
    {
     "frac": [
      [
       "24"
      ],
      [
       "√6"
      ]
     ]
    },
    " × ",
    {
     "frac": [
      [
       {
        "a": "√6",
        "kind": "text"
       }
      ],
      [
       {
        "a": "√6",
        "kind": "text"
       }
      ]
     ]
    },
    "　（同じルートを分母と分子にかける）"
   ],
   [
    "c = ",
    {
     "frac": [
      [
       {
        "a": "24√6",
        "kind": "text"
       }
      ],
      [
       {
        "a": "6",
        "kind": "text"
       }
      ]
     ]
    }
   ],
   [
    "c = ",
    {
     "a": "4√6",
     "kind": "text"
    }
   ]
  ],
  "extras": [
   "6√6",
   "2√6",
   "8√6"
  ],
  "hint": "正弦定理　a / sin A = b / sin B = c / sin C",
  "summary": "正弦定理を使い、分母のルートは有理化して答えを整えます。"
 }
];
