/* 平方根タワー：元教材の問題データをそのまま移植したもの（全115問）
   ただし次の2問だけ、元データの誤りを修正している。
     ・7F上級 2√12-4√27 … 選択肢に「-8√3」が2つ入っていた
     ・9F上級 4/(√7-√3) … 正解と数学的に等しい選択肢が2つ混ざっており、正解が3つあった */
window.DATA_ROOT_TOWER = {
 "stages": [
  {
   "name": "平方根を求める",
   "floor": "1F",
   "hasDifficulty": true
  },
  {
   "name": "平方根を求める",
   "floor": "2F",
   "hasDifficulty": false
  },
  {
   "name": "根号を外す",
   "floor": "3F",
   "hasDifficulty": true
  },
  {
   "name": "値を求める",
   "floor": "4F",
   "hasDifficulty": false
  },
  {
   "name": "乗除の基本",
   "floor": "5F",
   "hasDifficulty": true
  },
  {
   "name": "a√bの変形",
   "floor": "6F",
   "hasDifficulty": true
  },
  {
   "name": "加減の計算",
   "floor": "7F",
   "hasDifficulty": true
  },
  {
   "name": "展開の計算",
   "floor": "8F",
   "hasDifficulty": true
  },
  {
   "name": "分母の有理化",
   "floor": "9F",
   "hasDifficulty": true
  }
 ],
 "problems": {
  "1": {
   "beginner": [
    {
     "instruction": "次の数の平方根を求めなさい。",
     "q": "16",
     "choices": [
      "±4",
      "4",
      "±5",
      "8"
     ],
     "answer": "±4"
    },
    {
     "instruction": "次の数の平方根を求めなさい。",
     "q": "9",
     "choices": [
      "±3",
      "3",
      "±4",
      "4.5"
     ],
     "answer": "±3"
    },
    {
     "instruction": "次の数の平方根を求めなさい。",
     "q": "25",
     "choices": [
      "±5",
      "5",
      "±4",
      "12.5"
     ],
     "answer": "±5"
    },
    {
     "instruction": "次の数の平方根を求めなさい。",
     "q": "36",
     "choices": [
      "±6",
      "6",
      "±5",
      "18"
     ],
     "answer": "±6"
    },
    {
     "instruction": "次の数の平方根を求めなさい。",
     "q": "49",
     "choices": [
      "±7",
      "7",
      "±6",
      "24.5"
     ],
     "answer": "±7"
    }
   ],
   "intermediate": [
    {
     "instruction": "次の数の平方根を求めなさい。",
     "q": "36",
     "choices": [
      "±6",
      "6",
      "±5",
      "18"
     ],
     "answer": "±6"
    },
    {
     "instruction": "次の数の平方根を求めなさい。",
     "q": "64",
     "choices": [
      "±8",
      "8",
      "±7",
      "32"
     ],
     "answer": "±8"
    },
    {
     "instruction": "次の数の平方根を求めなさい。",
     "q": "81",
     "choices": [
      "±9",
      "9",
      "±8",
      "40.5"
     ],
     "answer": "±9"
    },
    {
     "instruction": "次の数の平方根を求めなさい。",
     "q": "100",
     "choices": [
      "±10",
      "10",
      "±9",
      "50"
     ],
     "answer": "±10"
    },
    {
     "instruction": "次の数の平方根を求めなさい。",
     "q": "121",
     "choices": [
      "±11",
      "11",
      "±10",
      "60.5"
     ],
     "answer": "±11"
    }
   ],
   "advanced": [
    {
     "instruction": "次の数の平方根を求めなさい。",
     "q": "100",
     "choices": [
      "±10",
      "10",
      "±9",
      "50"
     ],
     "answer": "±10"
    },
    {
     "instruction": "次の数の平方根を求めなさい。",
     "q": "121",
     "choices": [
      "±11",
      "11",
      "±10",
      "60.5"
     ],
     "answer": "±11"
    },
    {
     "instruction": "次の数の平方根を求めなさい。",
     "q": "169",
     "choices": [
      "±13",
      "13",
      "±12",
      "84.5"
     ],
     "answer": "±13"
    },
    {
     "instruction": "次の数の平方根を求めなさい。",
     "q": "196",
     "choices": [
      "±14",
      "14",
      "±13",
      "98"
     ],
     "answer": "±14"
    },
    {
     "instruction": "次の数の平方根を求めなさい。",
     "q": "225",
     "choices": [
      "±15",
      "15",
      "±14",
      "112.5"
     ],
     "answer": "±15"
    }
   ]
  },
  "2": {
   "beginner": [
    {
     "instruction": "次の数の平方根を求めなさい。",
     "q": "7",
     "choices": [
      "±√7",
      "√7",
      "±7",
      "3.5"
     ],
     "answer": "±√7"
    },
    {
     "instruction": "次の数の平方根を求めなさい。",
     "q": "13",
     "choices": [
      "±√13",
      "√13",
      "±13",
      "6.5"
     ],
     "answer": "±√13"
    },
    {
     "instruction": "次の数の平方根を求めなさい。",
     "q": "19",
     "choices": [
      "±√19",
      "√19",
      "±19",
      "9.5"
     ],
     "answer": "±√19"
    },
    {
     "instruction": "次の数の平方根を求めなさい。",
     "q": "2",
     "choices": [
      "±√2",
      "√2",
      "±2",
      "1"
     ],
     "answer": "±√2"
    },
    {
     "instruction": "次の数の平方根を求めなさい。",
     "q": "11",
     "choices": [
      "±√11",
      "√11",
      "±11",
      "5.5"
     ],
     "answer": "±√11"
    }
   ]
  },
  "3": {
   "beginner": [
    {
     "instruction": "次の数を根号を使わずに表しなさい。",
     "q": "√4",
     "choices": [
      "2",
      "±2",
      "√2",
      "4"
     ],
     "answer": "2"
    },
    {
     "instruction": "次の数を根号を使わずに表しなさい。",
     "q": "√16",
     "choices": [
      "4",
      "±4",
      "√32",
      "16"
     ],
     "answer": "4"
    },
    {
     "instruction": "次の数を根号を使わずに表しなさい。",
     "q": "√36",
     "choices": [
      "6",
      "±6",
      "√6",
      "18"
     ],
     "answer": "6"
    },
    {
     "instruction": "次の数を根号を使わずに表しなさい。",
     "q": "√49",
     "choices": [
      "7",
      "±7",
      "√7",
      "24.5"
     ],
     "answer": "7"
    },
    {
     "instruction": "次の数を根号を使わずに表しなさい。",
     "q": "√81",
     "choices": [
      "9",
      "±9",
      "√9",
      "40.5"
     ],
     "answer": "9"
    }
   ],
   "intermediate": [
    {
     "instruction": "次の数を根号を使わずに表しなさい。",
     "q": "√49",
     "choices": [
      "7",
      "±7",
      "√49",
      "24.5"
     ],
     "answer": "7"
    },
    {
     "instruction": "次の数を根号を使わずに表しなさい。",
     "q": "-√16",
     "choices": [
      "-4",
      "±4",
      "-√32",
      "16"
     ],
     "answer": "-4"
    },
    {
     "instruction": "次の数を根号を使わずに表しなさい。",
     "q": "-√36",
     "choices": [
      "-6",
      "±6",
      "-√6",
      "18"
     ],
     "answer": "-6"
    },
    {
     "instruction": "次の数を根号を使わずに表しなさい。",
     "q": "√64",
     "choices": [
      "8",
      "±8",
      "√64",
      "32"
     ],
     "answer": "8"
    },
    {
     "instruction": "次の数を根号を使わずに表しなさい。",
     "q": "-√100",
     "choices": [
      "-10",
      "±10",
      "-√100",
      "50"
     ],
     "answer": "-10"
    }
   ],
   "advanced": [
    {
     "instruction": "次の数を根号を使わずに表しなさい。",
     "q": "√100",
     "choices": [
      "10",
      "±10",
      "√100",
      "50"
     ],
     "answer": "10"
    },
    {
     "instruction": "次の数を根号を使わずに表しなさい。",
     "q": "-√121",
     "choices": [
      "-11",
      "±11",
      "-√121",
      "60.5"
     ],
     "answer": "-11"
    },
    {
     "instruction": "次の数を根号を使わずに表しなさい。",
     "q": "-√169",
     "choices": [
      "-13",
      "±13",
      "-√169",
      "84.5"
     ],
     "answer": "-13"
    },
    {
     "instruction": "次の数を根号を使わずに表しなさい。",
     "q": "√196",
     "choices": [
      "14",
      "±14",
      "√196",
      "98"
     ],
     "answer": "14"
    },
    {
     "instruction": "次の数を根号を使わずに表しなさい。",
     "q": "-√225",
     "choices": [
      "-15",
      "±15",
      "-√225",
      "112.5"
     ],
     "answer": "-15"
    }
   ]
  },
  "4": {
   "beginner": [
    {
     "instruction": "次の数を求めなさい。",
     "q": "(√2)²",
     "choices": [
      "2",
      "√2",
      "4",
      "1"
     ],
     "answer": "2"
    },
    {
     "instruction": "次の数を求めなさい。",
     "q": "(√5)²",
     "choices": [
      "5",
      "√5",
      "25",
      "2.5"
     ],
     "answer": "5"
    },
    {
     "instruction": "次の数を求めなさい。",
     "q": "(-√3)²",
     "choices": [
      "3",
      "-√3",
      "-3",
      "-9"
     ],
     "answer": "3"
    },
    {
     "instruction": "次の数を求めなさい。",
     "q": "(√7)²",
     "choices": [
      "7",
      "√7",
      "49",
      "3.5"
     ],
     "answer": "7"
    },
    {
     "instruction": "次の数を求めなさい。",
     "q": "(-√2)²",
     "choices": [
      "2",
      "-2",
      "4",
      "1"
     ],
     "answer": "2"
    }
   ]
  },
  "5": {
   "beginner": [
    {
     "instruction": "次の計算をしなさい。",
     "q": "√3×√2",
     "choices": [
      "√6",
      "√5",
      "√6×√6",
      "3√2"
     ],
     "answer": "√6"
    },
    {
     "instruction": "次の計算をしなさい。",
     "q": "√5×√3",
     "choices": [
      "√15",
      "√8",
      "√2",
      "5√3"
     ],
     "answer": "√15"
    },
    {
     "instruction": "次の計算をしなさい。",
     "q": "√2×√5",
     "choices": [
      "√10",
      "√7",
      "√3",
      "2√5"
     ],
     "answer": "√10"
    },
    {
     "instruction": "次の計算をしなさい。",
     "q": "√7×√2",
     "choices": [
      "√14",
      "7√2",
      "√9",
      "2√7"
     ],
     "answer": "√14"
    },
    {
     "instruction": "次の計算をしなさい。",
     "q": "√35÷√7",
     "choices": [
      "√5",
      "√7",
      "√28",
      "5"
     ],
     "answer": "√5"
    }
   ],
   "intermediate": [
    {
     "instruction": "次の計算をしなさい。",
     "q": "√3×√3",
     "choices": [
      "3",
      "√3",
      "√9",
      "1"
     ],
     "answer": "3"
    },
    {
     "instruction": "次の計算をしなさい。",
     "q": "√3×√6",
     "choices": [
      "√18",
      "3√2",
      "√9",
      "3"
     ],
     "answer": "3√2"
    },
    {
     "instruction": "次の計算をしなさい。",
     "q": "√5×(-√3)",
     "choices": [
      "-√15",
      "√15",
      "-√8",
      "-√2"
     ],
     "answer": "-√15"
    },
    {
     "instruction": "次の計算をしなさい。",
     "q": "√125÷√5",
     "choices": [
      "√5",
      "5",
      "√25",
      "√20"
     ],
     "answer": "5"
    },
    {
     "instruction": "次の計算をしなさい。",
     "q": "√216÷√6",
     "choices": [
      "6",
      "√36",
      "√210",
      "3√6"
     ],
     "answer": "6"
    }
   ],
   "advanced": [
    {
     "instruction": "次の計算をしなさい。",
     "q": "2√3×√3",
     "choices": [
      "6",
      "2√3",
      "3√3",
      "2√9"
     ],
     "answer": "6"
    },
    {
     "instruction": "次の計算をしなさい。",
     "q": "√6×2√3",
     "choices": [
      "6√2",
      "2√18",
      "2√9",
      "6√3"
     ],
     "answer": "6√2"
    },
    {
     "instruction": "次の計算をしなさい。",
     "q": "√6×(-√3)",
     "choices": [
      "-3√2",
      "√18",
      "-√9",
      "-√3"
     ],
     "answer": "-3√2"
    },
    {
     "instruction": "次の計算をしなさい。",
     "q": "-√125÷√5",
     "choices": [
      "-5",
      "5",
      "-√25",
      "√5"
     ],
     "answer": "-5"
    },
    {
     "instruction": "次の計算をしなさい。",
     "q": "2√6÷√216",
     "choices": [
      "<span class=\"frac\"><span class=\"num\">1</span><span class=\"den\">3</span></span>",
      "<span class=\"frac\"><span class=\"num\">2</span><span class=\"den\">3</span></span>",
      "<span class=\"frac\"><span class=\"num\">1</span><span class=\"den\">6</span></span>",
      "<span class=\"frac\"><span class=\"num\">2</span><span class=\"den\">6</span></span>"
     ],
     "answer": "<span class=\"frac\"><span class=\"num\">1</span><span class=\"den\">3</span></span>"
    }
   ]
  },
  "6": {
   "beginner": [
    {
     "instruction": "つぎの数をa√bの形に変形しなさい。",
     "q": "√8",
     "choices": [
      "2√2",
      "√8",
      "4√2",
      "2√4"
     ],
     "answer": "2√2"
    },
    {
     "instruction": "つぎの数をa√bの形に変形しなさい。",
     "q": "√12",
     "choices": [
      "2√3",
      "√12",
      "3√4",
      "4√3"
     ],
     "answer": "2√3"
    },
    {
     "instruction": "つぎの数をa√bの形に変形しなさい。",
     "q": "√18",
     "choices": [
      "3√2",
      "√18",
      "2√9",
      "9√2"
     ],
     "answer": "3√2"
    },
    {
     "instruction": "つぎの数をa√bの形に変形しなさい。",
     "q": "√20",
     "choices": [
      "2√5",
      "√20",
      "5√4",
      "4√5"
     ],
     "answer": "2√5"
    },
    {
     "instruction": "つぎの数をa√bの形に変形しなさい。",
     "q": "√27",
     "choices": [
      "3√3",
      "√27",
      "9√3",
      "3√9"
     ],
     "answer": "3√3"
    }
   ],
   "intermediate": [
    {
     "instruction": "つぎの数をa√bの形に変形しなさい。",
     "q": "√45",
     "choices": [
      "3√5",
      "√45",
      "5√9",
      "9√5"
     ],
     "answer": "3√5"
    },
    {
     "instruction": "つぎの数をa√bの形に変形しなさい。",
     "q": "√60",
     "choices": [
      "2√15",
      "√60",
      "15√4",
      "4√15"
     ],
     "answer": "2√15"
    },
    {
     "instruction": "つぎの数をa√bの形に変形しなさい。",
     "q": "√54",
     "choices": [
      "3√6",
      "√54",
      "6√9",
      "9√6"
     ],
     "answer": "3√6"
    },
    {
     "instruction": "つぎの数をa√bの形に変形しなさい。",
     "q": "√128",
     "choices": [
      "8√2",
      "√128",
      "2√64",
      "64√2"
     ],
     "answer": "8√2"
    },
    {
     "instruction": "つぎの数をa√bの形に変形しなさい。",
     "q": "√75",
     "choices": [
      "5√3",
      "√75",
      "3√25",
      "25√3"
     ],
     "answer": "5√3"
    }
   ],
   "advanced": [
    {
     "instruction": "つぎの数をa√bの形に変形しなさい。",
     "q": "√294",
     "choices": [
      "7√6",
      "√294",
      "6√49",
      "49√6"
     ],
     "answer": "7√6"
    },
    {
     "instruction": "つぎの数をa√bの形に変形しなさい。",
     "q": "√147",
     "choices": [
      "7√3",
      "√147",
      "3√49",
      "49√3"
     ],
     "answer": "7√3"
    },
    {
     "instruction": "つぎの数をa√bの形に変形しなさい。",
     "q": "√200",
     "choices": [
      "10√2",
      "√200",
      "2√100",
      "100√2"
     ],
     "answer": "10√2"
    },
    {
     "instruction": "つぎの数をa√bの形に変形しなさい。",
     "q": "√175",
     "choices": [
      "5√7",
      "√175",
      "7√25",
      "25√7"
     ],
     "answer": "5√7"
    },
    {
     "instruction": "つぎの数をa√bの形に変形しなさい。",
     "q": "√363",
     "choices": [
      "11√3",
      "√363",
      "3√121",
      "121√3"
     ],
     "answer": "11√3"
    }
   ]
  },
  "7": {
   "beginner": [
    {
     "instruction": "次の計算をしなさい。",
     "q": "3√2+2√2",
     "choices": [
      "5√2",
      "5√4",
      "√5",
      "√10"
     ],
     "answer": "5√2"
    },
    {
     "instruction": "次の計算をしなさい。",
     "q": "4√3+√3",
     "choices": [
      "5√3",
      "5√6",
      "4√4",
      "√7"
     ],
     "answer": "5√3"
    },
    {
     "instruction": "次の計算をしなさい。",
     "q": "6√5-2√5",
     "choices": [
      "4√5",
      "4√10",
      "8√5",
      "√5"
     ],
     "answer": "4√5"
    },
    {
     "instruction": "次の計算をしなさい。",
     "q": "7√2-3√2",
     "choices": [
      "4√2",
      "4√4",
      "10√2",
      "√2"
     ],
     "answer": "4√2"
    },
    {
     "instruction": "次の計算をしなさい。",
     "q": "2√3+3√3-√3",
     "choices": [
      "4√3",
      "5√6",
      "6√3",
      "√3"
     ],
     "answer": "4√3"
    }
   ],
   "intermediate": [
    {
     "instruction": "次の計算をしなさい。",
     "q": "√12+√3",
     "choices": [
      "3√3",
      "2√3+√3",
      "√15",
      "√12+√3"
     ],
     "answer": "3√3"
    },
    {
     "instruction": "次の計算をしなさい。",
     "q": "√20-√5",
     "choices": [
      "√5",
      "2√5-√5",
      "√15",
      "√20-√5"
     ],
     "answer": "√5"
    },
    {
     "instruction": "次の計算をしなさい。",
     "q": "√18+2√2",
     "choices": [
      "5√2",
      "3√2+2√2",
      "√20",
      "√18+2√2"
     ],
     "answer": "5√2"
    },
    {
     "instruction": "次の計算をしなさい。",
     "q": "3√8-√2",
     "choices": [
      "5√2",
      "6√2-√2",
      "√6",
      "3√8-√2"
     ],
     "answer": "5√2"
    },
    {
     "instruction": "次の計算をしなさい。",
     "q": "√27-√3",
     "choices": [
      "2√3",
      "3√3-√3",
      "√24",
      "√27-√3"
     ],
     "answer": "2√3"
    }
   ],
   "advanced": [
    {
     "instruction": "次の計算をしなさい。",
     "q": "√12+√27",
     "choices": [
      "5√3",
      "2√3+3√3",
      "√39",
      "√12+√27"
     ],
     "answer": "5√3"
    },
    {
     "instruction": "次の計算をしなさい。",
     "q": "2√12-4√27",
     "choices": [
      "-8√3",
      "4√3-12√3",
      "8√3",
      "√12-√27"
     ],
     "answer": "-8√3"
    },
    {
     "instruction": "次の計算をしなさい。",
     "q": "√50+√8-√2",
     "choices": [
      "6√2",
      "5√2+2√2-√2",
      "7√2",
      "√56"
     ],
     "answer": "6√2"
    },
    {
     "instruction": "次の計算をしなさい。",
     "q": "3√20-2√45+√5",
     "choices": [
      "√5",
      "6√5-6√5+√5",
      "2√5",
      "3√20-2√45+√5"
     ],
     "answer": "√5"
    },
    {
     "instruction": "次の計算をしなさい。",
     "q": "2√8+√18-√32",
     "choices": [
      "√2",
      "4√2+3√2-4√2",
      "3√2",
      "2√8+√18-√32"
     ],
     "answer": "√2"
    }
   ]
  },
  "8": {
   "beginner": [
    {
     "instruction": "次の計算をしなさい。",
     "q": "√2(√2+1)",
     "choices": [
      "2+√2",
      "√2+1",
      "3+√2",
      "2√2"
     ],
     "answer": "2+√2"
    },
    {
     "instruction": "次の計算をしなさい。",
     "q": "√3(√3+2)",
     "choices": [
      "3+2√3",
      "√3+2",
      "5+√3",
      "3√3"
     ],
     "answer": "3+2√3"
    },
    {
     "instruction": "次の計算をしなさい。",
     "q": "√5(√5-1)",
     "choices": [
      "5-√5",
      "√5-1",
      "4-√5",
      "√5"
     ],
     "answer": "5-√5"
    },
    {
     "instruction": "次の計算をしなさい。",
     "q": "√2(3√2+1)",
     "choices": [
      "6+√2",
      "3√2+√2",
      "5+√2",
      "√2"
     ],
     "answer": "6+√2"
    },
    {
     "instruction": "次の計算をしなさい。",
     "q": "√3(√3-√2)",
     "choices": [
      "3-√6",
      "3-√2",
      "2-√6",
      "√3"
     ],
     "answer": "3-√6"
    }
   ],
   "intermediate": [
    {
     "instruction": "次の計算をしなさい。",
     "q": "√2(3√2-2)",
     "choices": [
      "6-2√2",
      "3√2-2",
      "5",
      "√2"
     ],
     "answer": "6-2√2"
    },
    {
     "instruction": "次の計算をしなさい。",
     "q": "√5(1+√5)",
     "choices": [
      "√5+5",
      "1+√5",
      "6",
      "√5+√5"
     ],
     "answer": "√5+5"
    },
    {
     "instruction": "次の計算をしなさい。",
     "q": "(√2+1)²",
     "choices": [
      "3+2√2",
      "2+1",
      "4+2√2",
      "5√2"
     ],
     "answer": "3+2√2"
    },
    {
     "instruction": "次の計算をしなさい。",
     "q": "(√3+1)(√3-1)",
     "choices": [
      "2",
      "3",
      "4",
      "6"
     ],
     "answer": "2"
    },
    {
     "instruction": "次の計算をしなさい。",
     "q": "(√5+2)(√5-2)",
     "choices": [
      "1",
      "3",
      "4",
      "9"
     ],
     "answer": "1"
    }
   ],
   "advanced": [
    {
     "instruction": "次の計算をしなさい。",
     "q": "(√3+2)²",
     "choices": [
      "7+4√3",
      "3+4",
      "9+4√3",
      "√3+4"
     ],
     "answer": "7+4√3"
    },
    {
     "instruction": "次の計算をしなさい。",
     "q": "(2√2-1)²",
     "choices": [
      "9-4√2",
      "8-1",
      "8-4√2",
      "4-2√2"
     ],
     "answer": "9-4√2"
    },
    {
     "instruction": "次の計算をしなさい。",
     "q": "(√6+√2)(√6-√2)",
     "choices": [
      "4",
      "6",
      "8",
      "6-2"
     ],
     "answer": "4"
    },
    {
     "instruction": "次の計算をしなさい。",
     "q": "(2√5+2)(2√5-2)",
     "choices": [
      "16",
      "20",
      "18",
      "20-4"
     ],
     "answer": "16"
    },
    {
     "instruction": "次の計算をしなさい。",
     "q": "(3√2+1)(3√2-1)",
     "choices": [
      "17",
      "18",
      "19",
      "20"
     ],
     "answer": "17"
    }
   ]
  },
  "9": {
   "beginner": [
    {
     "instruction": "次の式の分母を有理化しなさい。",
     "q": "<span class=\"frac\"><span class=\"num\">1</span><span class=\"den\">√2</span></span>",
     "choices": [
      "<span class=\"frac\"><span class=\"num\">√2</span><span class=\"den\">2</span></span>",
      "<span class=\"frac\"><span class=\"num\">1</span><span class=\"den\">2</span></span>",
      "√2",
      "2"
     ],
     "answer": "<span class=\"frac\"><span class=\"num\">√2</span><span class=\"den\">2</span></span>"
    },
    {
     "instruction": "次の式の分母を有理化しなさい。",
     "q": "<span class=\"frac\"><span class=\"num\">1</span><span class=\"den\">√3</span></span>",
     "choices": [
      "<span class=\"frac\"><span class=\"num\">√3</span><span class=\"den\">3</span></span>",
      "<span class=\"frac\"><span class=\"num\">1</span><span class=\"den\">3</span></span>",
      "√3",
      "3"
     ],
     "answer": "<span class=\"frac\"><span class=\"num\">√3</span><span class=\"den\">3</span></span>"
    },
    {
     "instruction": "次の式の分母を有理化しなさい。",
     "q": "<span class=\"frac\"><span class=\"num\">2</span><span class=\"den\">√5</span></span>",
     "choices": [
      "<span class=\"frac\"><span class=\"num\">2√5</span><span class=\"den\">5</span></span>",
      "<span class=\"frac\"><span class=\"num\">2</span><span class=\"den\">5</span></span>",
      "2√5",
      "5"
     ],
     "answer": "<span class=\"frac\"><span class=\"num\">2√5</span><span class=\"den\">5</span></span>"
    },
    {
     "instruction": "次の式の分母を有理化しなさい。",
     "q": "<span class=\"frac\"><span class=\"num\">3</span><span class=\"den\">√2</span></span>",
     "choices": [
      "<span class=\"frac\"><span class=\"num\">3√2</span><span class=\"den\">2</span></span>",
      "<span class=\"frac\"><span class=\"num\">3</span><span class=\"den\">2</span></span>",
      "3√2",
      "2"
     ],
     "answer": "<span class=\"frac\"><span class=\"num\">3√2</span><span class=\"den\">2</span></span>"
    },
    {
     "instruction": "次の式の分母を有理化しなさい。",
     "q": "<span class=\"frac\"><span class=\"num\">1</span><span class=\"den\">√6</span></span>",
     "choices": [
      "<span class=\"frac\"><span class=\"num\">√6</span><span class=\"den\">6</span></span>",
      "<span class=\"frac\"><span class=\"num\">1</span><span class=\"den\">6</span></span>",
      "√6",
      "6"
     ],
     "answer": "<span class=\"frac\"><span class=\"num\">√6</span><span class=\"den\">6</span></span>"
    }
   ],
   "intermediate": [
    {
     "instruction": "次の式の分母を有理化しなさい。",
     "q": "<span class=\"frac\"><span class=\"num\">2</span><span class=\"den\">√2</span></span>",
     "choices": [
      "<span class=\"frac\"><span class=\"num\">2√2</span><span class=\"den\">2</span></span>",
      "√2",
      "2√2",
      "2"
     ],
     "answer": "√2"
    },
    {
     "instruction": "次の式の分母を有理化しなさい。",
     "q": "<span class=\"frac\"><span class=\"num\">√2</span><span class=\"den\">√3</span></span>",
     "choices": [
      "<span class=\"frac\"><span class=\"num\">√6</span><span class=\"den\">3</span></span>",
      "<span class=\"frac\"><span class=\"num\">√2</span><span class=\"den\">3</span></span>",
      "√6",
      "3"
     ],
     "answer": "<span class=\"frac\"><span class=\"num\">√6</span><span class=\"den\">3</span></span>"
    },
    {
     "instruction": "次の式の分母を有理化しなさい。",
     "q": "<span class=\"frac\"><span class=\"num\">4</span><span class=\"den\">√2</span></span>",
     "choices": [
      "<span class=\"frac\"><span class=\"num\">4√2</span><span class=\"den\">2</span></span>",
      "2√2",
      "4√2",
      "2"
     ],
     "answer": "2√2"
    },
    {
     "instruction": "次の式の分母を有理化しなさい。",
     "q": "<span class=\"frac\"><span class=\"num\">6</span><span class=\"den\">√3</span></span>",
     "choices": [
      "<span class=\"frac\"><span class=\"num\">6√3</span><span class=\"den\">3</span></span>",
      "2√3",
      "6√3",
      "2"
     ],
     "answer": "2√3"
    },
    {
     "instruction": "次の式の分母を有理化しなさい。",
     "q": "<span class=\"frac\"><span class=\"num\">3</span><span class=\"den\">√6</span></span>",
     "choices": [
      "<span class=\"frac\"><span class=\"num\">3√6</span><span class=\"den\">6</span></span>",
      "<span class=\"frac\"><span class=\"num\">√6</span><span class=\"den\">2</span></span>",
      "3√6",
      "<span class=\"frac\"><span class=\"num\">1</span><span class=\"den\">2</span></span>"
     ],
     "answer": "<span class=\"frac\"><span class=\"num\">√6</span><span class=\"den\">2</span></span>"
    }
   ],
   "advanced": [
    {
     "instruction": "次の式の分母を有理化しなさい。",
     "q": "<span class=\"frac\"><span class=\"num\">8</span><span class=\"den\">√2</span></span>",
     "choices": [
      "<span class=\"frac\"><span class=\"num\">8√2</span><span class=\"den\">2</span></span>",
      "4√2",
      "8√2",
      "4"
     ],
     "answer": "4√2"
    },
    {
     "instruction": "次の式の分母を有理化しなさい。",
     "q": "<span class=\"frac\"><span class=\"num\">9</span><span class=\"den\">√3</span></span>",
     "choices": [
      "<span class=\"frac\"><span class=\"num\">9√3</span><span class=\"den\">3</span></span>",
      "3√3",
      "9√3",
      "3"
     ],
     "answer": "3√3"
    },
    {
     "instruction": "次の式の分母を有理化しなさい。",
     "q": "<span class=\"frac\"><span class=\"num\">3√2</span><span class=\"den\">√3</span></span>",
     "choices": [
      "<span class=\"frac\"><span class=\"num\">3√6</span><span class=\"den\">3</span></span>",
      "√6",
      "3√6",
      "<span class=\"frac\"><span class=\"num\">√6</span><span class=\"den\">2</span></span>"
     ],
     "answer": "√6"
    },
    {
     "instruction": "次の式の分母を有理化しなさい。",
     "q": "<span class=\"frac\"><span class=\"num\">1</span><span class=\"den\">√7+√5</span></span>",
     "choices": [
      "<span class=\"frac\"><span class=\"num\">√7-√5</span><span class=\"den\">2</span></span>",
      "<span class=\"frac\"><span class=\"num\">√7-√5</span><span class=\"den\">1</span></span>",
      "√7-√5",
      "<span class=\"frac\"><span class=\"num\">1</span><span class=\"den\">2</span></span>"
     ],
     "answer": "<span class=\"frac\"><span class=\"num\">√7-√5</span><span class=\"den\">2</span></span>"
    },
    {
     "instruction": "次の式の分母を有理化しなさい。",
     "q": "<span class=\"frac\"><span class=\"num\">4</span><span class=\"den\">√7-√3</span></span>",
     "choices": [
      "√7+√3",
      "<span class=\"frac\"><span class=\"num\">√7+√3</span><span class=\"den\">4</span></span>",
      "<span class=\"frac\"><span class=\"num\">√7+√3</span><span class=\"den\">2</span></span>",
      "√7-√3"
     ],
     "answer": "√7+√3"
    }
   ]
  }
 }
};
