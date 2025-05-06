import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

interface CardItem {
  id: string;
  title: string;
  icon: any;
  onPress: () => void;
}

interface CardSectionProps {
  title: string;
  items: CardItem[];
}

const CardSection: React.FC<CardSectionProps> = ({ title, items }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.cardContainer}>
        {items.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            onPress={item.onPress}
          >
            <View style={styles.iconContainer}>
              <Image source={item.icon} style={styles.icon} />
            </View>
            <Text style={styles.cardTitle}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
    paddingHorizontal: 4,
  },
  cardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  card: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.5,
    marginBottom: 8,
    padding: 8,
  },
  icon: {
    width: '121%',
    height: '121%',
    resizeMode: 'contain',
  },
  cardTitle: {
    fontSize: 12,
    textAlign: 'center',
    color: '#333',
    fontWeight: '500',
    lineHeight: 16,
  },
});

export default CardSection; 