import { Modal } from 'antd'
import { ModalProps } from '../../types/StoreTypes'

export const CustomModal: React.FC<ModalProps> = (props) => {
    return <>
        <Modal key='modal-comp' visible={props.modalVisible} title={props.modalTitle} width={props.modalWidth} onCancel={e => props.getClose(false)} footer={false}>
            {props.modalForm}
        </Modal>
    </>
}