import React, { useState, useRef } from 'react';
import { View, Text, FlatList, Switch, StyleSheet, Pressable, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, useCameraDevice } from 'react-native-vision-camera';

const studentsData = [
    { id: 'S001', name: 'John Doe' },
    { id: 'S002', name: 'Jane Smith' },
    { id: 'S003', name: 'Alice Johnson' },
    { id: 'S004', name: 'Bob Williams' },
];

const AttendanceScreen = () => {
    const [attendance, setAttendance] = useState({});
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [capturedPhoto, setCapturedPhoto] = useState(null);
    const device = useCameraDevice('back');
    const cameraRef = useRef(null);

    const toggleAttendance = (id) => {
        setAttendance((prevState) => ({
            ...prevState,
            [id]: !prevState[id],
        }));
    };

    const handleSmartAttendance = () => {
        setIsCameraOpen(true);
    };

    const handleCapture = async () => {
        if (cameraRef.current) {
            try {
                const photo = await cameraRef.current.takePhoto();
                setCapturedPhoto(photo.path);
            } catch (error) {
                Alert.alert('Error', 'Failed to capture image.');
            }
        }
    };

    const handleUpload = async () => {
        if (!capturedPhoto) return;

        const formData = new FormData();
        formData.append('photo', {
            uri: `file://${capturedPhoto}`,
            name: 'attendance.jpg',
            type: 'image/jpeg',
        });

        try {
            const response = await fetch('https://your-api.com/upload-photo', {
                method: 'POST',
                headers: { 'Content-Type': 'multipart/form-data' },
                body: formData,
            });

            const result = await response.json();

            if (response.ok) {
                result.presentStudents.forEach((studentId) => {
                    toggleAttendance(studentId);
                });
                Alert.alert('Success', 'Attendance updated successfully!');
                setIsCameraOpen(false);
                setCapturedPhoto(null);
            } else {
                Alert.alert('Error', result.message || 'Failed to upload.');
            }
        } catch (error) {
            Alert.alert('Error', 'Network error, please try again later.');
        }
    };

    const handleSubmit = () => {
        const presentStudents = studentsData.filter((student) => attendance[student.id]);
        const absentStudents = studentsData.filter((student) => !attendance[student.id]);

        if (presentStudents.length === 0 && absentStudents.length === 0) {
            Alert.alert('Error', 'Please mark attendance before submitting.');
            return;
        }

        Alert.alert(
            'Attendance Summary',
            `✅ Present: ${presentStudents.map((s) => s.name).join(', ') || 'None'}\n❌ Absent: ${absentStudents.map((s) => s.name).join(', ') || 'None'}`,
            [{ text: 'OK' }]
        );

        // API Call Example
        // submitAttendance({ present: presentStudents, absent: absentStudents });
    };

    return (
        <SafeAreaView style={styles.container}>
            {isCameraOpen ? (
                <View style={styles.cameraContainer}>
                    {capturedPhoto ? (
                        <Image source={{ uri: `file://${capturedPhoto}` }} style={styles.preview} />
                    ) : (
                        <Camera
                            ref={cameraRef}
                            style={StyleSheet.absoluteFill}
                            device={device}
                            isActive={true}
                            photo
                        />
                    )}

                    <View style={styles.cameraControls}>
                        {capturedPhoto ? (
                            <>
                                <Pressable style={styles.button} onPress={handleUpload}>
                                    <Text style={styles.buttonText}>Upload</Text>
                                </Pressable>
                                <Pressable style={styles.button} onPress={() => setCapturedPhoto(null)}>
                                    <Text style={styles.buttonText}>Retake</Text>
                                </Pressable>
                            </>
                        ) : (
                            <>
                                <Pressable style={styles.button} onPress={handleCapture}>
                                    <Text style={styles.buttonText}>Capture</Text>
                                </Pressable>
                                <Pressable style={styles.button} onPress={() => setIsCameraOpen(false)}>
                                    <Text style={styles.buttonText}>Close Camera</Text>
                                </Pressable>
                            </>
                        )}
                    </View>
                </View>
            ) : (
                <>
                    <Pressable style={styles.button} onPress={handleSmartAttendance}>
                        <Text style={styles.buttonText}>Take Attendance Smartly</Text>
                    </Pressable>

                    <FlatList
                        data={studentsData}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <View style={styles.studentRow}>
                                <Text style={styles.studentText}>{item.id} - {item.name}</Text>
                                <Switch
                                    value={attendance[item.id] || false}
                                    onValueChange={() => toggleAttendance(item.id)}
                                />
                            </View>
                        )}
                    />

                    <Pressable style={styles.submitButton} onPress={handleSubmit}>
                        <Text style={styles.submitButtonText}>Submit Attendance</Text>
                    </Pressable>
                </>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 20,
    },
    cameraContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    preview: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    cameraControls: {
        position: 'absolute',
        bottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    studentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#fff',
        marginBottom: 10,
        borderRadius: 10,
        elevation: 3,
    },
    studentText: {
        fontSize: 16,
    },
    button: {
        backgroundColor: '#007bff',
        padding: 10,
        borderRadius: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    submitButton: {
        marginTop: 20,
        backgroundColor: '#28a745',
        padding: 10,
        borderRadius: 8,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default AttendanceScreen;
