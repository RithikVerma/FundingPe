import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface TabItem {
  id: string;
  label: string;
  icon: string;
  onPress: () => void;
  active?: boolean;
}

interface BottomTabBarProps {
  tabs: TabItem[];
}

const BottomTabBar: React.FC<BottomTabBarProps> = ({ tabs }) => {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={styles.tabItem}
          onPress={tab.onPress}
        >
          <Text style={[styles.tabIcon, tab.active && styles.activeIcon]}>
            {tab.icon}
          </Text>
          <Text style={[styles.tabLabel, tab.active && styles.activeLabel]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'white',
    height: 60,
    borderTopWidth: 1,
    borderTopColor: '#e1e1e1',
    paddingBottom: 5,
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 5,
  },
  tabIcon: {
    fontSize: 24,
    marginBottom: 2,
    color: '#757575',
  },
  activeIcon: {
    color: '#1a4b8b',
  },
  tabLabel: {
    fontSize: 12,
    color: '#757575',
  },
  activeLabel: {
    color: '#1a4b8b',
  },
});

export default BottomTabBar; 