function orderReducer(order, action) {
  const { type, cart, city, 
    shippingCost, phone, addressDetails, 
    secondAddress, notes, user 
  } = action

  const calculateTotal = () => {
    let total = 0;
    cart.forEach(product => total += product.quantityPrice)
    return total;
  }

  switch (type) {
    case 'update_products':
      return {...order, products: cart, total: order.shippingCost + calculateTotal(), subtotal: calculateTotal()};
    case 'update_costumer':
      return {...order, 
        costumer: {...order.costumer, 
          costumerId: user?.userId || '',
          fullName: user?.fullName || '',
          email: user?.email || '',
          phone: user?.phone | ''
        },
        shippingAddress: {...order.shippingAddress,
          addressDetails: user?.addressDetails || '',
          secondAddress: user?.secondAddress || '',
        },
        notes: user?.notes || ''
      }      
    case 'update_shipping_fee_and_inp':
      return {...order, shippingCost, shippingAddress: {...order.shippingAddress, city}, total: order.subtotal + shippingCost};
    case 'default_number_is_selected':
    case 'phone':
      return {...order, costumer: {...order.costumer, phone}};
    case 'addressDetails':
      return {...order, shippingAddress: {...order.shippingAddress, addressDetails}};
    case 'secondAddress':
      return {...order, shippingAddress: {...order.shippingAddress, secondAddress}};
    case 'notes':
      return {...order, notes};
    default:
      console.error('Error: Unknown type: ' + type);
      return {...order};
  }
}

export default orderReducer;