export interface MeContact {
	name: string;
	url: string;
	icon: string;
}

export interface MeSkillCategory {
	category: string;
	items: string[];
}

export interface MeProjectsItem {
	title: string;
	period: string;
	description: string;
}

export interface MeData {
	highlights: string[];
	contacts: MeContact[];
	skills: MeSkillCategory[];
	projects: MeProjectsItem[];
}

const meData: MeData = {

	highlights: [
	],
	contacts: [
		{
			name: "GitHub",
			url: "https://github.com/sharninjak",
			icon: "fa7-brands:github",
		},
		{
			name: "Bilibili",
			url: "https://space.bilibili.com/391685867",
			icon: "fa7-brands:bilibili",
		},
		// {
		// 	name: "Gitee",
		// 	url: "https://gitee.com/sharninjak",
		// 	icon: "mdi:git",
		// },
	],
	skills: [
		// {
		// 	category: "Frontend",
		// 	items: ["TypeScript", "Astro", "Svelte", "Tailwind CSS"],
		// },
		// {
		// 	category: "Engineering",
		// 	items: ["Node.js", "pnpm", "Git", "Content Workflow"],
		// },
	],
	projects: [
		// {
		// 	title: "Build personal site with Mizuki",
		// 	period: "2026",
		// 	description: "定制导航、内容页与多语言配置，完善主题体验。",
		// },
		// {
		// 	title: "Set up content separation workflow",
		// 	period: "2026",
		// 	description: "通过脚本同步内容仓库，降低内容维护成本。",
		// },
	],
};

export const getMe = (): MeData => meData;

export const getMeStats = () => ({
	highlightCount: meData.highlights.length,
	contactCount: meData.contacts.length,
	skillCategoryCount: meData.skills.length,
	projectCount: meData.projects.length,
});

export const getMeHighlights = () => meData.highlights;

export const getMeContacts = () => meData.contacts;

export const getMeSkills = () => meData.skills;

export const getMeProjects = () => meData.projects;

export default meData;
