document.addEventListener('DOMContentLoaded', (event) => {
    const predictButton = document.getElementById('predictButton');
    predictButton.addEventListener('click', uploadAndPredict);
    var class_names = ['Cyst', 'Normal', 'Stone', 'Tumor'];

    async function preprocessImage(image) {
        const tensor = tf.browser.fromPixels(image);
        const resized = tf.image.resizeBilinear(tensor, [224, 224]);
        const normalized = resized.div(tf.scalar(255));
        return normalized.expandDims(0); // Add a batch dimension
    }

    async function predictImage(image, model) {
        const preprocessedImage = await preprocessImage(image);
        const predictions = await model.predict(preprocessedImage);
        const classIndex = predictions.argMax(1).dataSync()[0];
        const probability = predictions.dataSync()[0][classIndex];
        return { classIndex, probability };
    }

    async function uploadAndPredict() {
        const loadedModel = await tf.loadLayersModel('model/model.json');
        const fileInput = document.getElementById('file');
        const file = fileInput.files[0];

        if (file) {
            const reader = new FileReader();

            reader.onload = async (e) => {
                const loadedImage = new Image();
                loadedImage.onload = async () => {
                    try {
                        const model = loadedModel;

                        if (model) {
                            const predictionResult = await predictImage(loadedImage, model);
                            const classLabel = class_names[predictionResult.classIndex];
                            document.getElementById('predictionText').textContent = `Prediction: ${classLabel}`;
                            const probabilityElement = document.getElementById('predictionProbability');
                            if (predictionResult.probability !== undefined) {
                                const probabilityText = `(Probability: ${predictionResult.probability.toFixed(4)})`;
                                probabilityElement.textContent = probabilityText;
                            } else {
                                probabilityElement.textContent = ''; // Handle undefined probability
                            }

                            // Display the uploaded image
                            const uploadedImageElement = document.getElementById('uploadedImage');
                            uploadedImageElement.src = loadedImage.src;
                            uploadedImageElement.style.display = 'block'; // Make sure the image is visible

                            // Display the prediction result container
                            document.getElementById('predictionResult').style.display = 'block';
                        } else {
                            alert('Error loading model');
                        }
                    } catch (error) {
                        console.error('Error during prediction:', error);
                        alert('An error occurred during prediction');
                    }
                };

                loadedImage.src = e.target.result;
            };

            reader.readAsDataURL(file);
        }
    }
});
