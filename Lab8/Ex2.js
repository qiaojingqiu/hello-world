require("./products_data.js");

var item_num = 0;
for (var item_num = 1;eval("typeof name"+item_num) != 'undefined';item_num++) {
    console.log(`${item_num}.${eval('name' + item_num)}`);
}
console.log("That's all we have!");