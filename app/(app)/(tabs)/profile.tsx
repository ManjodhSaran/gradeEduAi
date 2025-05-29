import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaWrapper } from '@/components/layout/SafeAreaWrapper';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Colors from '@/constants/Colors';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { logout, updateUser } from '@/store/slices/authSlice';
import { useRouter } from 'expo-router';
import { User, Mail, Key, LogOut, ChevronRight, Bell, Moon, CircleHelp as HelpCircle, Shield } from 'lucide-react-native';
import Constants from 'expo-constants';

export default function ProfileScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  
  // For demo purposes, we'll use local state instead of Redux
  // const { user } = useSelector((state: RootState) => state.auth);
  
  const [user, setUser] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    username: 'johndoe',
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user.name);
  const [editedEmail, setEditedEmail] = useState(user.email);
  const [isLoading, setIsLoading] = useState(false);
  
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  
  const handleLogout = async () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            try {
              // In a real app, this would dispatch the logout action
              // await dispatch(logout()).unwrap();
              router.replace('/(auth)/login');
            } catch (error) {
              Alert.alert('Error', 'Failed to log out. Please try again.');
            }
          },
        },
      ]
    );
  };
  
  const handleEdit = () => {
    setIsEditing(true);
  };
  
  const handleCancel = () => {
    setIsEditing(false);
    setEditedName(user.name);
    setEditedEmail(user.email);
  };
  
  const handleSave = async () => {
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editedEmail)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // In a real app, this would update the user via API and Redux
      // await dispatch(updateUser({ name: editedName, email: editedEmail })).unwrap();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state for demo
      setUser({
        ...user,
        name: editedName,
        email: editedEmail,
      });
      
      setIsEditing(false);
      setIsLoading(false);
      
      Alert.alert('Success', 'Profile updated successfully.');
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };
  
  const renderProfileSection = () => {
    if (isEditing) {
      return (
        <View style={styles.editForm}>
          <Input
            label="Name"
            value={editedName}
            onChangeText={setEditedName}
            leftIcon={<User size={20} color={Colors.neutral[500]} />}
          />
          
          <Input
            label="Email"
            value={editedEmail}
            onChangeText={setEditedEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Mail size={20} color={Colors.neutral[500]} />}
          />
          
          <View style={styles.editButtons}>
            <Button
              title="Cancel"
              onPress={handleCancel}
              variant="outline"
              style={styles.cancelButton}
            />
            <Button
              title="Save"
              onPress={handleSave}
              loading={isLoading}
              style={styles.saveButton}
            />
          </View>
        </View>
      );
    }
    
    return (
      <>
        <View style={styles.profileHeader}>
          <Image
            source={{ uri: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg' }}
            style={styles.profileImage}
          />
          <Text style={styles.profileName}>{user.name}</Text>
          <Text style={styles.profileUsername}>@{user.username}</Text>
          
          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <Mail size={20} color={Colors.primary[600]} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user.email}</Text>
            </View>
          </View>
        </View>
      </>
    );
  };

  return (
    <SafeAreaWrapper style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>
      
      <ScrollView style={styles.scrollView}>
        {renderProfileSection()}
        
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: Colors.primary[100] }]}>
                <Bell size={20} color={Colors.primary[600]} />
              </View>
              <Text style={styles.settingText}>Notifications</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: Colors.neutral[300], true: Colors.primary[400] }}
              thumbColor={Platform.OS === 'android' ? Colors.white : ''}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: Colors.secondary[100] }]}>
                <Moon size={20} color={Colors.secondary[600]} />
              </View>
              <Text style={styles.settingText}>Dark Mode</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: Colors.neutral[300], true: Colors.secondary[400] }}
              thumbColor={Platform.OS === 'android' ? Colors.white : ''}
            />
          </View>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: Colors.accent[100] }]}>
                <Key size={20} color={Colors.accent[600]} />
              </View>
              <Text style={styles.settingText}>Change Password</Text>
            </View>
            <ChevronRight size={20} color={Colors.neutral[400]} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: Colors.success[100] }]}>
                <HelpCircle size={20} color={Colors.success[500]} />
              </View>
              <Text style={styles.settingText}>Help & Support</Text>
            </View>
            <ChevronRight size={20} color={Colors.neutral[400]} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: Colors.warning[100] }]}>
                <Shield size={20} color={Colors.warning[500]} />
              </View>
              <Text style={styles.settingText}>Privacy Policy</Text>
            </View>
            <ChevronRight size={20} color={Colors.neutral[400]} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>
            Version {Constants.expoConfig?.version || '1.0.0'}
          </Text>
        </View>
        
        <Button
          title="Log Out"
          onPress={handleLogout}
          variant="outline"
          style={styles.logoutButton}
          leftIcon={<LogOut size={20} color={Colors.error[500]} />}
          textStyle={{ color: Colors.error[500] }}
        />
      </ScrollView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
    backgroundColor: Colors.white,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary[700],
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    padding: 24,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.neutral[800],
    marginBottom: 4,
  },
  profileUsername: {
    fontSize: 16,
    color: Colors.neutral[500],
    marginBottom: 16,
  },
  editButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: Colors.primary[50],
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary[200],
  },
  editButtonText: {
    color: Colors.primary[600],
    fontWeight: '500',
  },
  infoSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral[50],
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.neutral[500],
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: Colors.neutral[800],
  },
  editForm: {
    padding: 16,
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  saveButton: {
    flex: 1,
    marginLeft: 8,
  },
  settingsSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.neutral[800],
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingText: {
    fontSize: 16,
    color: Colors.neutral[800],
  },
  logoutButton: {
    margin: 16,
    marginTop: 0,
    borderColor: Colors.error[500],
  },
  versionContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  versionText: {
    fontSize: 14,
    color: Colors.neutral[500],
  },
});