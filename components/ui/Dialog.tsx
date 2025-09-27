import { Modal, StyleSheet, Text, View } from 'react-native';
import { PropsWithChildren } from 'react';
import { COLORS, GlobalStyles } from '../../constants';
import Divider from './Divider';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
}

function Dialog({
  children,
  open,
  onOpenChange,
  title,
}: PropsWithChildren<DialogProps>) {
  return (
    <View style={styles.container}>
      <Modal
        visible={open}
        animationType="slide"
        transparent={true}
        onRequestClose={() => onOpenChange(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            {title && (
              <>
                <Text style={styles.modalTitle}>{title}</Text>
                <Divider />
              </>
            )}
            {children}
          </View>
        </View>
      </Modal>
    </View>
  );
}

export default Dialog;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: GlobalStyles.fontSize.title3,
  },
  modalContent: {
    backgroundColor: COLORS.bgPrimary,
    borderRadius: GlobalStyles.spacing.xs,
    padding: GlobalStyles.spacing.s,
    width: 320,
  },
});
