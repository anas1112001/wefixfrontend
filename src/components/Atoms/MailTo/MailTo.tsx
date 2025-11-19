import React from 'react';

const Mailto = ({ body = "", children, email, subject = "" }) => {
    let params = [];
  
    if (subject) {
        params.push(`subject=${encodeURIComponent(subject)}`);
    }
  
    if (body) {
        params.push(`body=${encodeURIComponent(body)}`);
    }

    const paramString = params.length > 0 ? `?${params.join('&')}` : "";

    return <a href={`mailto:${email}${paramString}`}>{children}</a>;
};

export default Mailto;
