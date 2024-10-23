function cosineSimilarity(array1, array2) {
  if (
    array1.length !== array2.length ||
    array1[0].length !== array2[0].length
  ) {
    throw new Error("Arrays must have the same dimensions.");
  }

  // Calculate dot product
  const dotProduct = array1.reduce((sum, row1) => {
    return (
      sum +
      row1.reduce(
        (sum2, value1, index1) =>
          sum2 + value1 * array2[row1.indexOf(value1)][index1],
        0
      )
    );
  }, 0);

  // Calculate magnitudes of both arrays
  const magnitude1 = Math.sqrt(
    array1.reduce((sum, row1) => {
      return sum + row1.reduce((sum2, value1) => sum2 + value1 * value1, 0);
    }, 0)
  );

  const magnitude2 = Math.sqrt(
    array2.reduce((sum, row2) => {
      return sum + row2.reduce((sum2, value2) => sum2 + value2 * value2, 0);
    }, 0)
  );

  // Calculate cosine similarity
  return dotProduct / (magnitude1 * magnitude2);
}
var array1 = [
  [1, -0.52525, 0.852],
  [0.213, 0.52, -0.125],
];
console.log(cosineSimilarity(array1, array1));
