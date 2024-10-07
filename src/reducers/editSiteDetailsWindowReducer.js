 function editSiteDetailsWindowReducer (editSiteDetails, action) {
  const { type, name, value, socialLinks } = action;

  switch (type) {
    case 'socialLinks_is_loaded':
      if (editSiteDetails.loaded) return editSiteDetails;
      return { ...socialLinks, loaded: true, toggle: '' }
    case 'edit_siteDetails_button_is_clicked':
      return { ...editSiteDetails, toggle: ' show' };
    case 'siteDetails_window_background_is_clicked':
    case 'cancel_siteDetails_window_button_is_clicked':
    case 'websiteDetails_data_is_updated':
      return { ...editSiteDetails, toggle: ' hide' };
    case 'add_inputs_values':
      return { ...editSiteDetails, [name]: value };
    default:
      console.error('Error: unknown type: ', type);
      return { ...editSiteDetails };
  }
}

export default editSiteDetailsWindowReducer;