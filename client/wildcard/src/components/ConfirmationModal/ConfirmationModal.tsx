import React from 'react'

import { Button, ButtonProps } from '../Button'
import { Modal } from '../Modal'

export interface ConfirmationModalProps {
    showModal: boolean
    onCancel: () => void
    onConfirm: () => void
    ariaLabel: string
    disabled?: boolean
    variant?: ButtonProps['variant']
}

export const ConfirmationModal: React.FunctionComponent<React.PropsWithChildren<ConfirmationModalProps>> = props => {
    const { showModal, onCancel, onConfirm, children, ariaLabel, disabled, variant = 'primary' } = props

    return (
        <Modal isOpen={showModal} position="center" aria-label={ariaLabel}>
            {children}
            <div className="d-flex justify-content-end">
                <Button className="mr-2" onClick={onCancel} outline={true} variant="secondary" disabled={disabled}>
                    Cancel
                </Button>
                <Button onClick={onConfirm} variant={variant} disabled={disabled}>
                    Confirm
                </Button>
            </div>
        </Modal>
    )
}
