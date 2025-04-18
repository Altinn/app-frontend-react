import type { NestedTexts } from 'src/language/languages';

export function en() {
  return {
    dateTime: {
      am: 'AM',
      pm: 'PM',
    },
    altinn: {
      standard_validation: {
        file_content_type_not_allowed:
          'It looks like you are trying to upload a file type that is not allowed. Please make sure that the file is actually the type it claims to be.',
      },
    },
    actions: {
      sign: 'Sign',
      confirm: 'Confirm',
      reject: 'Reject',
      instantiate: 'Instantiate',
    },
    address_component: {
      address: 'Street Address',
      care_of: 'C/O or other additional address',
      house_number: 'House Number',
      house_number_helper:
        'If several residents share the same address you must provide house number. It consists of one letter and four numbers and should be listed at your front door.',
      post_place: 'Post Place',
      simplified: 'Simplified',
      title_text_binding: 'Search for title for address component',
      zip_code: 'Zip Code',
      validation_error_zipcode: 'Zip code is invalid',
      validation_error_house_number: 'House number is invalid',
    },
    confirm: {
      answers: 'Your responses',
      attachments: 'Attachments',
      body: 'You are ready to submit {0}. Before you submit, we recommend that you look over and verify your responses. You cannot change your responses after submitting.',
      button_text: 'Submit',
      deadline: 'Deadline',
      sender: 'Party',
      title: 'Check your responses before submitting',
    },
    custom_actions: {
      general_error: 'Something went wrong with this action. Please try again later.',
    },
    date_picker: {
      invalid_date_message: 'Invalid date format. Use the format {0}.',
      cancel_label: 'Cancel',
      clear_label: 'Clear',
      today_label: 'Today',
      min_date_exeeded: 'Date should not be before minimal date',
      max_date_exeeded: 'Date should not be after maximal date',
      aria_label_icon: 'Open date picker',
      aria_label_left_arrow: 'Last month.',
      aria_label_right_arrow: 'Next month.',
      aria_label_year_dropdown: 'Select year',
      aria_label_month_dropdown: 'Select month',
      format_text: 'For example {0}',
    },
    feedback: {
      title: '## You will soon be forwarded',
      body: 'Waiting for verification. When this is complete you will be forwarded to the next step or receipt automatically.',
    },
    form_filler: {
      error_add_subform: 'Failed to add subform entry, please try again.',
      error_delete_subform: 'An error occurred while deleting the subform entry, please try again.',
      error_fetch_subform: 'Error loading form data',
      error_max_count_reached_subform_server: 'The maximum number of {0} entries has been reached',
      error_max_count_reached_subform_local: 'The maximum number of {0} entries has been reached ({1})',
      error_min_count_not_reached_subform: 'At least {0} {1} entry is required',
      error_validation_inside_subform: 'There are errors in one of more {0} entries',
      subform_default_header: 'Items',
      alert_confirm: 'Confirm',
      checkbox_alert: 'Are you sure you want to uncheck?',
      multi_select_alert: 'Are you sure you want to delete <b>{0}</b>?',
      dropdown_alert: 'Are you sure you want to change to <b>{0}</b>?',
      back_to_summary: 'Return to summary',
      error_report_header: 'These need to be corrected before continuing',
      error_required: 'You have to fill out {0}',
      file_upload_valid_file_format_all: 'all',
      file_uploader_add_attachment: 'Add more attachments',
      file_uploader_drag: 'Drag and drop or',
      file_uploader_find: 'find a file',
      file_uploader_list_delete: 'Delete attachment',
      file_uploader_delete_warning: 'Are you sure you want to delete this attachment?',
      file_uploader_delete_button_confirm: 'Yes, delete attachment',
      file_uploader_list_header_file_size: 'File size',
      file_uploader_list_header_name: 'Name',
      file_uploader_list_header_status: 'Status',
      file_uploader_list_header_delete_sr: 'Delete',
      file_uploader_list_status_done: 'Uploaded',
      file_uploader_max_size: 'Maximum file size',
      file_uploader_mb: 'MB',
      file_uploader_upload: 'Upload file',
      file_uploader_number_of_files: 'Number of files {0}.',
      file_uploader_show_more_errors: 'Show {0} more',
      file_uploader_show_fewer_errors: 'Show fewer',
      file_uploader_valid_file_format: 'Valid file types are:',
      file_uploader_failed_to_upload_file: 'The file <u title="{1}">{0}</u> could not be uploaded',
      file_uploader_validation_error_delete: 'Something went wrong trying to delete the file, please try again.',
      file_uploader_validation_error_exceeds_max_files:
        'You can not upload more than {0} files. No files were uploaded.',
      file_uploader_validation_error_file_ending: 'is not an allowed file type.',
      file_uploader_validation_error_file_number: 'You need to upload {0} attachement(s) to continue',
      file_uploader_validation_error_file_size: '{0} exeeds the valid file size.',
      file_uploader_validation_error_general:
        'There was a problem with the file {0}. Make sure the file has correct file type and does not exeed the size limit.',
      file_uploader_validation_error_upload: 'Something went wrong trying to upload the file, please try again.',
      file_uploader_validation_error_update: 'Something went wrong trying to update the filetag, please try again.',
      file_uploader_validation_error_no_chosen_tag: 'You have to choose one {0}',
      placeholder_receipt_header: 'The form has been submitted',
      placeholder_user: 'OLA PRIVATPERSON',
      radiobutton_alert_label: 'Are you sure you want to change from {0}?',
      required_description: 'Required fields are marked with *',
      required_label: '*',
      summary_item_change: 'Change',
      summary_go_to_correct_page: 'Go to the correct page in the form',
      address: 'Street Address',
      careOf: 'C/O or other additional address',
      houseNumber: 'House Number',
      postPlace: 'Post Place',
      zipCode: 'Zip Code',
      no_options_found: 'No matches found',
      clear_selection: 'Clear selection',
      person_lookup_ssn: 'national ID number/D-number',
      person_lookup_name: 'name',
      organisation_lookup_orgnr: 'organisation number',
      organisation_lookup_name: 'organisation name',
    },
    navigation: {
      main: 'App navigation',
      form: 'Form navigation',
      to_main_content: 'Go to main content',
      go_to_task: 'Navigate to {0}',
      form_pages: 'Form pages',
      back_to_inbox: 'Back to inbox',
      inbox: 'Inbox',
      back_to_main_form: 'Back to {0}',
      main_form: '{0}',
      back: 'Back',
    },
    general: {
      action: 'Action',
      accessibility: 'Accessibility',
      accessibility_url: 'https://info.altinn.no/en/about-altinn/tilgjengelighet/',
      add_connection: 'Add connection',
      add_new: 'Add new',
      add: 'Add',
      back: 'Back',
      cancel: 'Cancel',
      choose_label: 'Choose label',
      choose_method: 'Choose method',
      choose: 'Choose',
      close: 'Close',
      contains: 'Contains{0}',
      control_submit: 'Control and submit',
      create_new: 'Create new',
      create: 'Create',
      customer_service_phone_number: '+47 75 00 60 00',
      customer_service_slack: 'https://altinn.slack.com/',
      customer_service_email: 'servicedesk@altinn.no',
      delete: 'Delete',
      download: 'Download {0}',
      disabled: 'Disabled',
      done: 'Done',
      edit_alt_error: 'Fix error here',
      edit_alt: 'Edit',
      edit: 'Edit',
      empty_summary: 'You have not entered any information here',
      enabled: 'Enabled',
      error_message_with_colon: 'Error message:',
      full_width: 'Expand width',
      standard_width: 'Reduce width',
      for: 'for',
      header_profile_icon_label: 'Profile icon button',
      label: 'Label',
      loading: 'Loading content',
      log_out: 'Log out',
      next: 'Next',
      no_options: 'No options available',
      optional: 'Optional',
      page_number: 'Page {0}',
      print_button_text: 'Print / Save as PDF',
      progress: 'Page {0} of {1}',
      required: 'Required',
      save: 'Save',
      save_and_close: 'Save and close',
      save_and_next: 'Save and open next',
      search: 'Search',
      select_field: 'Select field',
      service_description_header: 'Description',
      service_name: 'Name',
      service_owner: 'Owner',
      service_saved_name: 'Repository name',
      submit: 'Submit',
      validate_changes: 'Validate changes',
      value: 'Value',
      version: 'Version',
      wait_for_attachments: 'Hold on, we are processing attachments',
      part_of_form_completed: "This part of the form is not currently available. You can't change it.",
      invalid_task_id: 'This part of the form does not exist.',
      navigate_to_current_process: 'Navigate to the current process step',
    },
    group: {
      row_error: 'One of the rows is incorrectly filled out. This has to bee fixed before the schema can be submitted.',
      row_popover_delete_message: 'Are you sure you want to delete this row?',
      row_popover_delete_button_confirm: 'Yes, delete the row',
    },
    iframe_component: {
      unsupported_browser_title: 'Your browser is unsupported',
      unsupported_browser:
        'Your browser does not support iframes that use srcdoc. This may result in not being able to see all the content intended to be displayed here. We recommend trying a different browser.',
    },
    input_components: {
      character_limit_sr_label: 'Textfield has a maximum length of {0} characters',
      remaining_characters: 'You have {0} of {1} characters left',
      exceeded_max_limit: 'You have exceeded the maximum limit with {0} characters',
    },
    instance_selection: {
      changed_by: 'Changed by',
      continue: 'Continue here',
      description: 'Choose if you want to continue on an existing form, or if you want to start on a new one.',
      header: 'You have already started filling out this form.',
      last_changed: 'Last changed',
      left_of: 'Continue where you left of',
      new_instance: 'Start over',
    },
    instantiate: {
      all_forms: 'all forms',
      inbox: 'inbox',
      profile: 'profile',
      unknown_error_title: 'Unknow error',
      unknown_error_text: 'An unknown error occcurred, please try again later.',
      unknown_error_status: 'Unknow error',
      unknown_error_customer_support: 'If the problem persists, contact us at customer service at {0}.',
      forbidden_action_error_title: 'You do not have permission to perform this action.',
      forbidden_action_error_text: 'It looks like you do not have permission to perform this action.',
      forbidden_action_error_status: '403 - Forbidden',
      forbidden_action_error_customer_support: 'If you need help, contact us at customer service <br/> {0}.',
      authorization_error_main_title: 'You do not have permission to view this app.',
      authorization_error_instantiate_validation_title: 'You cannot start this service',
      authorization_error_rights: 'It looks like you do not have permission to start this service for {0}',
      authorization_error_ask:
        'If you are representing a person it is the one you are representing that can give you the required rights to start this service. If you are you representing an organization you have to ask for the required rights from persons with access delegation rights within your organization.',
      authorization_error_check_rights:
        '<a href="https://{0}/ui/Profile/" target="_blank">See who has rights to delegate access under "Others with rights within the organization"</a>.',
      authorization_error_info_rights:
        '<a href="https://{0}/hjelp/profil/enkelttjenester-og-roller/" target="_blank">Learn more about roles and rights</a>.',
      authorization_error_info_customer_service: 'You can also contact customer service at {0}.',
      authorization_error_instantiate_validation_info_customer_service:
        'If you need help, contact customer service at {0}.',
      starting: 'Just a minute, we’ll get the information you need',
    },
    language: {
      language_selection: 'Language',
      full_name: {
        nb: 'Norwegian bokmål',
        en: 'English',
        nn: 'Norwegian nynorsk',
      },
      selector: {
        label: 'Language',
      },
    },
    party_selection: {
      error_caption_prefix: 'Error',
      invalid_selection_non_existing_party:
        'You have started the service with an party that either does not exist or that you do not have access to. Select a new party below to continue.',
      invalid_selection_existing_party:
        'You started this app as {0}. This app is available for {1}. Choose another party below.',
      no_valid_selection_first_part: 'This is a app for {0}',
      no_valid_selection_second_part: 'It looks like you do not have access to a party who is allowed to start {0}.',
      no_valid_selection_third_part: 'To start this app, you must have accesses associated with {0}.',
      no_valid_selection_binding_word: 'and',
      change_party: 'change party here',
      read_more_roles_link: 'You can read more about roles and rights here.',
      binding_word: 'or',
      header: 'Who do you want to represent?',
      load_more: 'Load more',
      search_placeholder: 'Search for a party',
      subheader: 'Parties you can represent:',
      unit_type_private_person: 'private person',
      unit_type_company: 'company',
      unit_type_bankruptcy_state: 'bankruptcy state',
      unit_type_subunit: 'subunit',
      unit_type_subunit_plural: 'subunits',
      unit_deleted: 'deleted',
      unit_org_number: 'org. number',
      unit_personal_number: 'pers. number',
      show_deleted: 'Show deleted',
      show_sub_unit: 'Show sub units',
      why_seeing_this: 'Why am I seeing this?',
      seeing_this_preference:
        'You can change your [profile settings](https://altinn.no/ui/Profile) to not get prompted for party selection each time you start a new instance. You can find this setting under **Profile** > **Advanced settings** > **Do not ask what party I represent each time I start to fill in a new form**.',
      seeing_this_override: 'This app has been configured to always prompt you for party selection.',
    },
    payment: {
      pay: 'Pay',
      summary: 'Summary',
      alert: {
        paid: 'You have paid!',
        failed: 'Your payment has failed',
      },
      receipt: {
        title: 'Payment receipt',
        payment_id: 'Payment ID',
        altinn_ref: 'Altinn referance',
        payment_date: 'Date of purchase',
        total_amount: 'Total amount',
        receiver: 'Receiver',
        payer: 'Payer',
        name: 'Name',
        company_name: 'Company name',
        org_number: 'Organisasjonsnummer',
        contact_person: 'Contact person',
        contact_phone: 'Contact phone',
        contact_email: 'Contact email',
        phone: 'Phone',
        address: 'Address',
        org_num: 'Org number',
        account_number: 'Account number',
        card_number: 'Card number',
        card_expiry: 'Card expiry',
        email: 'Email',
      },
      component: {
        description: 'Description',
        quantity: 'Quantity',
        price: 'Price',
        total: 'Total',
        vat: 'VAT',
      },
    },
    organisation_lookup: {
      orgnr_label: 'Organisation number',
      org_name: 'Organisation name',
      from_registry_description: 'From the CCR',
      validation_error_not_found: 'Organisation number not found in the registry',
      validation_invalid_response_from_server: 'Invalid response from the server',
      unknown_error: 'An unknown error occurred. Please try again later',
      validation_error_orgnr: 'The organisation number is invalid',
    },
    person_lookup: {
      ssn_label: 'National ID number/D-number',
      surname_label: 'Surname',
      name_label: 'Name',
      from_registry_description: 'From the National Population Register',
      validation_error_name_too_short: "The name can't be empty.",
      validation_error_ssn: 'The national ID number/D-number is invalid.',
      validation_error_not_found:
        'No person is registered with this combination of national ID number/D-number and name. Please check the fields and try again. \n\nNote: After 5 failed attempts, the search functionality will be temporarily locked.',
      validation_error_too_many_requests: 'Too many requests. Please try again later.',
      validation_error_forbidden:
        'You do not have permission to perform this action. A security level of minimum 2 is required.',
      validation_invalid_response_from_server: 'An error occurred. Please try again later.',
      unknown_error: 'An unknown error occurred. Please try again later.',
    },
    helptext: {
      button_title: 'Help',
      button_title_prefix: 'Helptext for',
    },
    receipt: {
      attachments: 'Attachments',
      body: 'A mechanical check has been completed while filling in, but we reserve the right to detect errors during the processing of the case and that other documentation may be necessary. Please provide the reference number in case of any inquiries to the agency.',
      body_simple:
        'For security reasons, neither the content of the service nor this message will be visible in Altinn after you exit this page.',
      date_sent: 'Date sent',
      receiver: 'Receiver',
      receipt: 'Receipt',
      ref_num: 'Reference number',
      sender: 'Sender',
      subtitle: 'A copy of your receipt has been sent to your archive',
      title: 'The form is submitted',
      title_submitted: 'The following is submitted:',
    },
    receipt_platform: {
      attachments: 'Attachments',
      date_sent: 'Date sent',
      helper_text:
        'A mechanical check has been completed while filling in, but we reserve the right to detect errors during the processing of the case and that other documentation may be necessary. Please provide the reference number in case of any inquiries to the agency.',
      is_sent: 'is submitted',
      receipt: 'Receipt',
      receiver: 'Receiver',
      reference_number: 'Reference number',
      sender: 'Sender',
      sent_content: 'The following is submitted:',
      log_out: 'Log out',
      profile_icon_aria_label: 'Profile icon button',
    },
    soft_validation: {
      info_title: 'Information',
      warning_title: 'Note',
      success_title: 'How great!',
    },
    validation: {
      generic_field: 'this field',
    },
    validation_errors: {
      min: 'Minimum valid number is {0}',
      max: 'Maximum valid number is {0}',
      minLength: 'Use {0} or more characters',
      maxLength: 'Use {0} or fewer characters',
      length: 'Number of characters allowed is {0}',
      pattern: 'Wrong format or value',
      required: 'Field is required',
      enum: 'Only the values {0} are permitted',
      minItems: 'A minimum of {0} rows are required',
      maxItems: 'A maximum of {0} rows are permitted',
      formatMinimum: 'Minimum valid value is {0}',
      formatMaximum: 'Maximum valid value is {0}',
    },
    map_component: {
      selectedLocation: 'Selected location: {0}° north, {1}° east',
      noSelectedLocation: 'No selected location',
    },
    multiple_select_component: {
      no_options: 'No options available',
      placeholder: 'Select...',
    },
    list_component: {
      rowsPerPage: 'Rows per page',
      previousPage: 'Previous',
      previousPageAriaLabel: 'Previous page in the table',
      nextPage: 'Next',
      nextPageAriaLabel: 'Next page in the table',
    },
    config_error: {
      layoutset_subform_config_error_customer_support:
        'If you need help resolving this issue, reach out to Altinn via our support lines<br/><br/><ul><li>Phone: <a href="tel:{0}">{0}</a></li><li>Email: {1}</li><li>Slack: {2}</li></ul>',
      layoutset_subform_config_error:
        'Layout set with id <strong>{0}</strong> is configured incorrectly.<br /><br />The layout set cannot have both <strong>type</strong> <em>and</em> <strong>tasks</strong> defined.',
      layoutset_error: 'Layout set error',
      component_has_errors: 'An error occurred for <code>{0}</code>:',
      component_has_errors_after:
        'As long as the component has configuration errors, we cannot show it in the form. Fix the errors and try again.',
      subform_no_datatype_layoutset: 'Data type specification not found in layout-sets.json',
      subform_no_datatype_appmetadata: "Data type '{0}' was not found in applicationmetadata.json",
      subform_misconfigured_add_button:
        "Data type '{0}' is marked as 'disallowUserCreate=true', but the subform component is configured with 'showAddButton=true'. This is a contradiction, as the user will never be permitted to perform the add-button operation.",
      file_upload_same_binding:
        'There are multiple FileUpload components with the same data model binding. Each component must have a unique binding. Other components with the same binding: {0}',
    },
    version_error: {
      version_mismatch: 'Version mismatch',
      version_mismatch_message:
        'This version of the app frontend is not compatible with the version of the backend libraries you are using. Update to the latest version of the packages and try again.',
      min_backend_version: 'Minimum backend version is {0}',
    },
    missing_row_id_error: {
      title: 'Missing row-ID',
      message:
        'When data was loaded, a row-ID was missing. This is an error in the configuration of the form, and must be corrected using the migration tools. Sjekk loggene i utviklerverktøyene for mer informasjon.',
      full_message:
        'The data model is missing the property {0} in the path {1}. This should be automatically added to the data model if you are using the correct version of the NuGet packages and have run the migration tools. Read more about the tools in the documentation: https://docs.altinn.studio/community/changelog/app-nuget/v8/migrating-from-v7/',
    },
    likert: {
      left_column_default_header_text: 'Question',
    },
    process_error: {
      submit_error_please_retry: 'Something went wrong when submitting, please try again in a few minutes.',
    },
    pdfPreview: {
      error: 'Could not show PDF preview',
      defaultButtonText: 'Preview PDF',
    },
    taskTypes: {
      data: 'Fill out',
      signing: 'Signing',
      confirmation: 'Confirmation',
      payment: 'Payment',
      receipt: 'Receipt',
    },
  } satisfies NestedTexts;
}
