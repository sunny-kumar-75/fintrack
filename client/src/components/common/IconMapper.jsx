import React from 'react';
import * as LuIcons from 'react-icons/lu';

export default function IconMapper({ name, ...props }) {
  
  const IconComponent = LuIcons[name] || LuIcons.LuStar;
  return <IconComponent {...props} />;
}
