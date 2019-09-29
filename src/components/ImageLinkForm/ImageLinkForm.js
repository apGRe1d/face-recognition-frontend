import React from 'react';
import './ImageLinkForm.css'

const ImageLinkForm = ({onInputChange, onButtonSubmit}) => { 
	return (
		<div className='ma4 mt0'>
			<p className='text'>
				{'This app helps you to detect face in your pictures. Insert the link to the image in the input field and press detect! '}
			</p>
			<div className='center'>
				<div className='form center br3 shadow-5 form-block'>
					<input className='f4 pa2 center' type='tex' onChange={onInputChange}/>
					<button 
						className='grow link pv2 dib white bg-light-purple button'
						onClick={onButtonSubmit}
					>Detect</button>
				</div>
			</div>
		</div>
	);
}
export default ImageLinkForm;