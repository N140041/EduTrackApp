import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Camera } from 'react-native-vision-camera';

const studentsData = [
    { id: 'S001', name: 'John Doe', registered: true },
    { id: 'S002', name: 'Jane Smith', registered: false },
    { id: 'S003', name: 'Alice Johnson', registered: true },
    { id: 'S004', name: 'Bob Williams', registered: false },
];

const RegisterStudentsScreen = ({ navigation }) => {
    const [students, setStudents] = useState(studentsData);
    const [hasPermission, setHasPermission] = useState(false);

    useEffect(() => {
        requestCameraPermission();
    }, []);

    const requestCameraPermission = async () => {
        const status = await Camera.requestCameraPermission();
        console.log(status)
        if (status === 'granted') {
            setHasPermission(true);
        } else {
            Alert.alert(
                'Camera Permission Denied',
                 'Camera access is required to register students. Please enable it in settings.',
                [{ text: 'OK' }]
            );
        }
    };

    const handleRegister = async (student) => {
        if (!hasPermission) {
            Alert.alert('Permission Denied', 'Camera access is required to register students.');
            return;
        }

        navigation.navigate('CameraCapture', {
            student,
            onSuccess: () => markAsRegistered(student.id),
        });
    };

    const markAsRegistered = (studentId) => {
        setStudents((prevStudents) =>
            prevStudents.map((student) =>
                student.id === studentId ? { ...student, registered: true } : student
            )
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Register Students</Text>
            <FlatList
                data={students}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.studentRow}>
                        <Text style={styles.studentText}>{item.name}</Text>
                        <TouchableOpacity
                            style={[styles.button, item.registered && styles.registeredButton]}
                            onPress={() => handleRegister(item)}
                        >
                            <Text style={styles.buttonText}>
                                {item.registered ? 'Re-Register' : 'Register'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    studentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#fff',
        marginBottom: 10,
        borderRadius: 8,
        elevation: 3,
    },
    studentText: {
        fontSize: 16,
    },
    button: {
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 5,
        backgroundColor: '#007bff', // Default Blue
    },
    registeredButton: {
        backgroundColor: 'green', // Green for Re-Register
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
});

export default RegisterStudentsScreen;
