import CheckUserLevel from '../../../components/checkUserLevel';

export default function Layout({ children }) {
	return (
		<CheckUserLevel requiredLevel="expert">
			{children}
		</CheckUserLevel>
	);
}