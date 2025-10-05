import tensorflow as tf
import cv2
import numpy as np
import os

class KanAIModel:
    def __init__(self, model_path=None):
        """
        Initialize the AI model.
        If model_path is provided, load the trained model.
        Otherwise, create a new untrained model.
        """
        if model_path and os.path.exists(model_path):
            self.model = tf.keras.models.load_model(model_path)
            print(f"Loaded model from {model_path}")
        else:
            self.model = self.create_model()
            print("Created new Kan AI model")

    def create_model(self):
        """
        Creates a CNN model for image classification.
        Adjust layers and output size as needed.
        """
        model = tf.keras.Sequential([
            tf.keras.layers.Conv2D(32, (3,3), activation='relu', input_shape=(224,224,3)),
            tf.keras.layers.MaxPooling2D(2,2),
            tf.keras.layers.Conv2D(64, (3,3), activation='relu'),
            tf.keras.layers.MaxPooling2D(2,2),
            tf.keras.layers.Flatten(),
            tf.keras.layers.Dense(128, activation='relu'),
            tf.keras.layers.Dense(10, activation='softmax')  # Change 10 to your number of classes
        ])
        model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
        return model

    def preprocess_image(self, img_bytes):
        """
        Convert uploaded image bytes to model-ready numpy array.
        Expects image in bytes (from frontend upload).
        """
        # Convert bytes to numpy array
        nparr = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        # Resize and normalize
        img = cv2.resize(img, (224,224))
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        img = img / 255.0  # normalize to [0,1]
        img = np.expand_dims(img, axis=0)  # add batch dimension
        return img

    def predict(self, img_bytes):
        """
        Returns model prediction for the given image bytes.
        """
        if self.model is None:
            raise ValueError("Model is not initialized")

        img = self.preprocess_image(img_bytes)
        preds = self.model.predict(img)
        class_idx = np.argmax(preds, axis=1)[0]  # index of max prediction
        confidence = float(np.max(preds))
        return {"class_index": int(class_idx), "confidence": confidence}

# Test locally
if __name__ == "__main__":
    ai_model = KanAIModel()  # optionally pass a trained model path
    print("Kan AI Model ready!")

    # Example: test with local image file
    # with open("example.jpg", "rb") as f:
    #     result = ai_model.predict(f.read())
    #     print(result)
