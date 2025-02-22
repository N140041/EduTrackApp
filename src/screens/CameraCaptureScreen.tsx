import React, { useState, useRef, useEffect } from 'react';
import { View, TouchableOpacity, Text, Alert, Image, StyleSheet } from 'react-native';
import { Camera, useCameraDevice } from 'react-native-vision-camera';

const CameraCaptureScreen = ({ route, navigation }) => {
    const { student } = route.params;
    const device = useCameraDevice('back');
    const cameraRef = useRef(null);
    const [capturedPhoto, setCapturedPhoto] = useState(null);
    const [isCameraActive, setIsCameraActive] = useState(true);

    if (!device) {
        return <Text>No Camera Available</Text>;
    }

    const capturePhoto = async () => {
        if (cameraRef.current) {
            try {
                const photo = await cameraRef.current.takePhoto();
                setCapturedPhoto(photo.path); // Store the image path
                setIsCameraActive(false); // Stop the camera preview
            } catch (error) {
                Alert.alert('Error', 'Failed to capture image.');
            }
        }
    };

    const uploadPhoto = async () => {
        if (!capturedPhoto) return;

        const formData = new FormData();
        formData.append('studentId', student.id);
        formData.append('photo', {
            uri: `file://${capturedPhoto}`,
            name: 'photo.jpg',
            type: 'image/jpeg',
        });

        try {
            const response = await fetch('https://your-api.com/register-student', {
                method: 'POST',
                headers: { 'Content-Type': 'multipart/form-data' },
                body: formData,
            });

            const result = await response.json();
            if (response.ok) {
                Alert.alert('Success', `Student ${student.name} registered successfully!`);
                navigation.goBack();
            } else {
                Alert.alert('Error', result.message || 'Failed to register');
            }
        } catch (error) {
            Alert.alert('Error', 'Network error, please try again later');
        }
    };

    return (
        <View style={styles.container}>
            {isCameraActive ? (
                <Camera ref={cameraRef} style={StyleSheet.absoluteFill} device={device} isActive={true} photo />
            ) : (
                <Image source={{ uri: `file://${capturedPhoto}` }} style={styles.preview} />
            )}

            <View style={styles.controls}>
                {isCameraActive ? (
                    <TouchableOpacity style={styles.captureButton} onPress={capturePhoto}>
                        <Text style={styles.buttonText}>Capture</Text>
                    </TouchableOpacity>
                ) : (
                    <>
                        <TouchableOpacity style={styles.uploadButton} onPress={uploadPhoto}>
                            <Text style={styles.buttonText}>Upload</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.retakeButton} onPress={() => setIsCameraActive(true)}>
                            <Text style={styles.buttonText}>Retake</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },
    preview: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    controls: {
        position: 'absolute',
        bottom: 30,
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    captureButton: {
        backgroundColor: '#007bff',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    uploadButton: {
        backgroundColor: 'green',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    retakeButton: {
        backgroundColor: 'red',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
    },
});

export default CameraCaptureScreen;
