import React from 'react'
import { useTranslation } from 'react-i18next'

interface PaymentMethodTabsProps {
  paymentMethod: 'lightning' | 'onchain'
  onMethodChange: (method: 'lightning' | 'onchain') => void
}

export const PaymentMethodTabs: React.FC<PaymentMethodTabsProps> = ({
  paymentMethod,
  onMethodChange,
}) => {
  const { t } = useTranslation()

  return (
    <div className="flex justify-center mb-6">
      <div className="bg-gray-900/50 p-1 rounded-xl">
        {['lightning', 'onchain'].map((method) => (
          <button
            className={`px-6 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
              paymentMethod === method
                ? 'bg-blue-500 text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
            key={method}
            onClick={() => onMethodChange(method as 'lightning' | 'onchain')}
          >
            {method === 'lightning'
              ? t('orderChannel.step3.lightningTab')
              : t('orderChannel.step3.onchainTab')}
          </button>
        ))}
      </div>
    </div>
  )
}
