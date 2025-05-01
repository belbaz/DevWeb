import CheckUserLevel from '../../components/checkUserLevel';

// you need an account to be able to display profiles
export default function LayoutTest({ children }) {
	return (
		<CheckUserLevel requiredLevel="debutant">
			{children}
		</CheckUserLevel>
	);
}