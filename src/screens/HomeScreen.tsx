import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from './Common/constants';

let BEARER_TOKEN = ''; // Replace with your token
const HomeScreen = ({ navigation }) => {
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(false);
  const [studentsData, setStudentsData] = useState<any[]>([]);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          BEARER_TOKEN = token;
        }

        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      }
    };
    checkAuthStatus();
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'OK', onPress: async () => {
            await AsyncStorage.removeItem('authToken');
            navigation.replace('Login');
          }
        },
      ]
    );
  };

  const bulkUpload = async () => {
    Alert.alert(
      'Student Bulk Upload',
      'Currently This Feature Under Development.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'OK', onPress: async () => {
          }
        },
      ]
    );
  };

  const takeAttendance = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/attendance/history`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${BEARER_TOKEN}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch students');
      const data = await response.json();
      setStudentsData(data);
      console.log('data',data)
      if (data.length <= 0) {
        navigation.navigate('Attendance')
      } else {

        const presentList = data
          .filter((item) => item.status === 'present')
          .map((item) => item.user.name)
          .join(', ');

        const absentList = data
          .filter((item) => item.status === 'absent')
          .map((item) => item.user.name)
          .join(', ');

        Alert.alert(
          'Attendance Summary',
          `✅ Present: ${presentList || 'None'}\n❌ Absent: ${absentList || 'None'}`
        );

      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch students.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}> Hello, {user.name}</Text>
      <Text style={styles.title}>Role : {user.role}</Text>
      <TouchableOpacity style={styles.button} onPress={() => takeAttendance()}>
        <Text style={styles.buttonText}>Take Attendance</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('RegisterStudents')}>
        <Text style={styles.buttonText}>Register Student For Biometric</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => bulkUpload()}>
        <Text style={styles.buttonText}>Student Bulk Register</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      {loading && (
          <ActivityIndicator size="small" color="#007bff" />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  button: {
    width: 250,
    height: 60,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoutButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'red',
    borderRadius: 8,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HomeScreen;
