module.exports = {
  pickFromArray: (arr, start = 0, end = arr.length) => {
    if (start < 0) start = 0
    if (start > arr.length - 1) start = arr.length - 1
    if (end > arr.length - 1) end = arr.length - 1
    return arr[Math.floor(Math.random() * (end - start + 1)) + start]
  }
}