// app/styles.ts
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 40,
    right: 30,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#00ADEF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  // ... you could add other styles here
});