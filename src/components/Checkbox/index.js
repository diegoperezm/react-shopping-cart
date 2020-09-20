import React, { useState } from 'react';

function Checkbox(props) {
    var  [ isChecked, setIsChecked ]                            = useState(false);
    const { handleCheckboxChange, label, classes }  = props; 

    const toggleCheckboxChange = label => {
        setIsChecked(!isChecked);
        handleCheckboxChange(label);
    };

     return (
      <div className={classes}>
        <label>
          <input
            type="checkbox"
            value={label}
            checked={isChecked}
         onChange = {() =>  toggleCheckboxChange(label) }
          />
          <span className="checkmark">{label}</span>
        </label>
      </div>
    ); 

}

export default Checkbox;
