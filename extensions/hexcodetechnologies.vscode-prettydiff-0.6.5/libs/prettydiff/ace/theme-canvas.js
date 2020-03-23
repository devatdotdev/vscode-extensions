define("ace/theme/canvas",["require","exports","module","ace/lib/dom"],function(e,t,n){"use strict";t.isDark=!1,t.cssClass="ace-canvas",t.cssText='.ace-canvas .ace_gutter {background: #c8c8bb;color: #333;}.ace-canvas .ace_identifier{color:#930;}.ace-canvas .ace_print-margin {width: 1px;background: #e8e8e8;}.ace-canvas .ace_fold {background-color: #6B72E6;}.ace-canvas {background-color: #e8e8e8;color: black;}.ace-canvas .ace_cursor {color: black;}.ace-canvas .ace_invisible {color: rgb(191, 191, 191);}.ace-canvas .ace_storage,.ace-canvas .ace_keyword {color: #660;}.ace-canvas .ace_constant {color: rgb(197, 6, 11);}.ace-canvas .ace_constant.ace_buildin {color: rgb(88, 72, 246);}.ace-canvas .ace_constant.ace_language {color: rgb(88, 92, 246);}.ace-canvas .ace_constant.ace_library {color: #390;}.ace-canvas .ace_invalid {background-color: rgba(255, 0, 0, 0.1);color: red;}.ace-canvas .ace_support.ace_function {color: rgb(60, 76, 114);}.ace-canvas .ace_support.ace_constant {color: #390;}.ace-canvas .ace_support.ace_type,.ace-canvas .ace_support.ace_class {color: rgb(109, 121, 222);}.ace-canvas .ace_keyword.ace_operator {color: rgb(104, 118, 135);}.ace-canvas .ace_string {color: rgb(3, 106, 7);}.ace-canvas .ace_comment {color: rgb(76, 136, 107);}.ace-canvas .ace_comment.ace_doc {color: rgb(0, 102, 255);}.ace-canvas .ace_comment.ace_doc.ace_tag {color: rgb(128, 159, 191);}.ace-canvas .ace_constant.ace_numeric {color: rgb(0, 0, 205);}.ace-canvas .ace_variable {color: rgb(49, 132, 149);}.ace-canvas .ace_xml-pe {color: rgb(104, 104, 91);}.ace-canvas .ace_entity.ace_name.ace_function {color: #0000A2;}.ace-canvas .ace_heading {color: rgb(12, 7, 255);}.ace-canvas .ace_list {color:rgb(185, 6, 144);}.ace-canvas .ace_meta.ace_tag {color:rgb(0, 22, 142);}.ace-canvas .ace_string.ace_regex {color: rgb(255, 0, 0)}.ace-canvas .ace_marker-layer .ace_selection {background: rgb(181, 213, 255);}.ace-canvas.ace_multiselect .ace_selection.ace_start {box-shadow: 0 0 3px 0px white;border-radius: 2px;}.ace-canvas .ace_marker-layer .ace_step {background: rgb(252, 255, 0);}.ace-canvas .ace_marker-layer .ace_stack {background: rgb(164, 229, 101);}.ace-canvas .ace_marker-layer .ace_bracket {margin: -1px 0 0 -1px;border: 1px solid rgb(192, 192, 192);}.ace-canvas .ace_marker-layer .ace_active-line {background: rgba(0, 0, 0, 0.07);}.ace-canvas .ace_gutter-active-line {background-color : #dcdcdc;}.ace-canvas .ace_marker-layer .ace_selected-word {background: rgb(250, 250, 255);border: 1px solid rgb(200, 200, 250);}.ace-canvas .ace_indent-guide {background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAACCAYAAACZgbYnAAAAE0lEQVQImWP4////f4bLly//BwAmVgd1/w11/gAAAABJRU5ErkJggg==") right repeat-y;}';var r=e("../lib/dom");r.importCssString(t.cssText,t.cssClass)})
