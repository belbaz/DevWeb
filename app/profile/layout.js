import CheckUserLevel from '../../components/checkUserLevel';

export default function LayoutTest({ children }) {
	return (
		<CheckUserLevel requiredLevel="debutant">
			{console.log("test layout")}
			{children}
		</CheckUserLevel>
	);
}