<?php  
/**
 * @package Open_Comment_Box
 * @version 1.6
 */
/*
Plugin Name: Open Comment Box
Plugin URI: http://meteorhacks.2013.nodeknockout.com
Description: Open Source Realtime Comments Platform.
Author: Open Comment Box
Version: 1.0
Author URI: http://meteorhacks.com
*/


add_action('admin_init', 'sandbox_initialize_theme_options');  
function sandbox_initialize_theme_options() {  
  
    // First, we register a section. This is necessary since all future options must belong to one.   
    add_settings_section(  
        'general_settings_section',         // ID used to identify this section and with which to register options  
        'Open Coment Box',                  // Title to be displayed on the administration page  
        'sandbox_general_options_callback', // Callback used to render the description of the section  
        'general'                           // Page on which to add this section of options  
    );  
      
    // Next, we will introduce the fields for toggling the visibility of content elements.  
    add_settings_field(   
        'show_header',                      // ID used to identify the field throughout the theme  
        'OCB HTML',                           // The label to the left of the option interface element  
        'sandbox_toggle_header_callback',   // The name of the function responsible for rendering the option interface  
        'general',                          // The page on which this option will be displayed  
        'general_settings_section',         // The name of the section to which this field belongs  
        array(                              // The array of arguments to pass to the callback. In this case, just a description.  
            'Activate this setting to display the header.'  
        )  
    );  
 
      
add_settings_field(   
    'Input Element',                          
    'Input Element',                              
    'sandbox_input_element_callback',     
    'sandbox_theme_input_examples',   
    'input_examples_section'              
); 
    // Finally, we register the fields with WordPress  
    register_setting(  
        'general',  
        'show_header'  
    );  

} // end sandbox_initialize_theme_options  
  
/* ------------------------------------------------------------------------ * 
 * Section Callbacks 
 * ------------------------------------------------------------------------ */   
  
/** 
 * This function provides a simple description for the General Options page.  
 * 
 * It is called from the 'sandbox_initialize_theme_options' function by being passed as a parameter 
 * in the add_settings_section function. 
 */  
function sandbox_general_options_callback() {  
    echo '<p>Paste the Open Comment Box HTML Below</p>';  
} // end sandbox_general_options_callback  
  
function sandbox_toggle_header_callback($args) {  

   $html = '<textarea rows="4" name="show_header"  cols="50" value="1" >'.get_option('show_header').'</textarea>';

    echo $html;  
      
} // end sandbox_toggle_header_callback  
  

add_filter(  'the_content' , custom_shortcode);

function custom_shortcode($content) {
		  return get_option('show_header');
}

?>  