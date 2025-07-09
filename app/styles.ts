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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  menuButton: {
    width: '100%',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center',
  },
  menuButtonText: {
    fontSize: 18,
    color: 'refresh-blue', // A standard blue for actions
  },
  closeButtonText: {
    fontSize: 18,
    color: 'coral-accent', // A standard red for close/cancel actions
    fontWeight: 'bold',
  },
  // ... you could add other styles here
});