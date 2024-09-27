 function editProfileWindowReducer (userProfile, action) {
  const { type, name, value, full_name, phone, address_details, second_address, notes } = action;

  switch (type) {
    case 'user_data_has_changed':
      return {...userProfile, full_name, phone, address_details, second_address, notes};
    case 'edit_personal_details_btn_is_clicked':
      return {...userProfile, toggle: ' show'};
    case 'personalDetails_window_background_is_clicked':
    case 'cancel_personalDetails_window_button_is_clicked':
    case 'user_data_is_updated':
      return {...userProfile, toggle: ' hide'};
    case 'add_inputs_values':
      return {...userProfile, toggle: ' show', [name]: value};
    default:
      console.error('Error: unknown type: ', type);
      return {...userProfile};
  }
}

export default editProfileWindowReducer;