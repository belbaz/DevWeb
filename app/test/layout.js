import CheckUserLevel from '../../components/checkUserLevel';

export default function LayoutTest({ children }) {
	return (
		<CheckUserLevel requiredLevel="advanced">
			{children}
		</CheckUserLevel>
	);
}