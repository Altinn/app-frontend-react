import React from 'react';

import { useLanguage } from 'src/hooks/useLanguage';
import classes from 'src/layout/FileUpload/FileUploadTable/FileTableHeader.module.css';
export function FileTableHeader({ mobileView, tagTitle }: { mobileView: boolean; tagTitle?: string }) {
  const { lang } = useLanguage();

  return (
    <thead>
      <tr
        className={classes.blueUnderline}
        id='altinn-file-list-row-header'
      >
        <th>{lang('form_filler.file_uploader_list_header_name')}</th>
        {!mobileView ? <th>{lang('form_filler.file_uploader_list_header_file_size')}</th> : null}
        {tagTitle ? <th>{tagTitle}</th> : null}
        {!(tagTitle && mobileView) ? <th>{lang('form_filler.file_uploader_list_header_status')}</th> : null}
        <th>
          <p className='sr-only'>{lang('form_filler.file_uploader_list_header_delete_sr')}</p>
        </th>
      </tr>
    </thead>
  );
}
